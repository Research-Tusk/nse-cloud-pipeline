/**
 * Vercel Serverless Function: /api/live
 *
 * Query params:
 *   exchange = nse | bse
 *   file     = live | hourly | history | share
 *
 * `live` and `hourly` are computed from today's rows in Supabase
 * ({exchange}_live_snapshots) — the pipeline that used to write
 * dashboard/data/{exchange}_live.json / _live_hourly.json via scheduled
 * GitHub Actions was disabled 2026-10-28 (ExchangesDash cutover), and
 * nothing writes those files in this repo any more, so proxying them
 * straight from GitHub (the old approach) meant serving data frozen at
 * the moment of cutover. `history` and `share` are still slow-moving,
 * git-committed files and are proxied from GitHub unchanged.
 *
 * Mirrors the day-type classification and EOD-prediction math in
 * scripts/live_common.py — see that file for the fuller explanation of
 * each piece. Keep the two in sync if the model changes.
 *
 * Example: GET /api/live?exchange=nse&file=live
 */

const REPO_RAW = 'https://raw.githubusercontent.com/Research-Tusk/nse-cloud-pipeline/main/dashboard/data';

const VALID_EXCHANGES = ['nse', 'bse'];

const GITHUB_FILE_MAP = {
  history: (e) => `${e}_hourly_history.json`,
  share:   ()  => 'bse_share_analysis.json',
};

// ── Shared constants (mirrors scripts/live_common.py) ──────────────────────

const MARKET_OPEN_MIN  = 9 * 60 + 15; // 9:15 AM IST
const MARKET_TOTAL_MIN = 405;         // 4:00 PM IST — SEBI Closing Auction Session EOD
const MIN_SAMPLES      = 3;
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const REFERENCE_CHECKPOINTS = [
  ['10:00', 45], ['11:00', 105], ['12:00', 165], ['13:00', 225],
  ['14:00', 285], ['15:00', 345], ['16:00', 405],
];
const EXPIRY_WEEKDAY     = { nse: 1, bse: 3 }; // NSE Tue, BSE Thu
const PRE_EXPIRY_WEEKDAY = { nse: 0, bse: 2 }; // day before expiry

// ── IST time helpers ────────────────────────────────────────────────────────

const IST_OFFSET_MIN = 5 * 60 + 30;

// `Date` arithmetic here is all offset-based (UTC + 5:30), not Intl/timezone
// lookups, since IST has no DST to worry about.
function toIST(utcDate) {
  return new Date(utcDate.getTime() + IST_OFFSET_MIN * 60000);
}

function istDateStr(istDate) {
  return istDate.toISOString().slice(0, 10);
}

// Today's [start, end) window in IST, expressed as UTC ISO strings for the
// Supabase query (captured_at is stored as timestamptz, i.e. UTC).
function todayISTRangeUTC(nowUTC) {
  const nowIST  = toIST(nowUTC);
  const dateStr = istDateStr(nowIST);
  const startUTC = new Date(`${dateStr}T00:00:00+05:30`);
  const endUTC   = new Date(startUTC.getTime() + 24 * 3600000);
  return { dateStr, startUTC, endUTC };
}

// ── Day-type classification (mirrors classify_day in live_common.py) ───────
// Simple weekday rule only — no holiday-shift lookup, since that needs the
// full trading-day calendar the Python side built from its own archive.
// Good enough for "which bucket does today fall into" on a live dashboard;
// the archived `day_type` recorded at EOD (done historically, pre-cutover)
// is what the fraction-curve lookup actually keys off of.
function classifyDay(dateObj, exchange) {
  const wd = dateObj.getUTCDay() === 0 ? 6 : dateObj.getUTCDay() - 1; // 0=Mon..4=Fri
  if (wd === EXPIRY_WEEKDAY[exchange]) return 'expiry';
  if (wd === PRE_EXPIRY_WEEKDAY[exchange]) return 'pre_expiry';
  return 'normal';
}

// ── Interpolation + historical fraction curve ───────────────────────────────

function interp(points, target) {
  if (!points.length) return null;
  if (target < points[0][0] || target > points[points.length - 1][0]) return null;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i], [x1, y1] = points[i + 1];
    if (x0 <= target && target <= x1) return x1 === x0 ? y0 : y0 + (target - x0) / (x1 - x0) * (y1 - y0);
  }
  return points[points.length - 1][1];
}

function avgCheckpointFractions(days) {
  const acc = {};
  days.forEach(day => {
    Object.entries(day.checkpoints || {}).forEach(([label, cp]) => {
      if (cp && cp.fraction != null) (acc[label] = acc[label] || []).push(cp.fraction);
    });
  });
  const out = {};
  Object.entries(acc).forEach(([label, vals]) => { out[label] = vals.reduce((a, b) => a + b, 0) / vals.length; });
  return out;
}

function bestFractionCurve(historyDays, todayDayType, todayWeekday) {
  const allDays = historyDays.filter(d => (d.eod_revenue || 0) > 0);

  function trySet(days, method) {
    if (days.length < MIN_SAMPLES) return [null, null];
    const fracs = avgCheckpointFractions(days);
    return Object.keys(fracs).length ? [fracs, method] : [null, null];
  }

  const specific = allDays.filter(d => d.day_type === todayDayType && d.weekday === todayWeekday);
  let [f, m] = trySet(specific, `historical/${todayDayType}/wd${todayWeekday}`);
  if (f) return [f, m];

  const typed = allDays.filter(d => d.day_type === todayDayType);
  [f, m] = trySet(typed, `historical/${todayDayType}`);
  if (f) return [f, m];

  [f, m] = trySet(allDays, 'historical/overall');
  if (f) return [f, m];

  return [null, 'none'];
}

function predictEodLive(elapsedNow, revenueNow, historyDays, todayDayType, todayWeekday) {
  if (!revenueNow || revenueNow <= 0 || elapsedNow == null || elapsedNow <= 0) return [null, 'none'];

  const [curve, method] = bestFractionCurve(historyDays, todayDayType, todayWeekday);
  if (curve) {
    const points = [[0, 0.0]]
      .concat(REFERENCE_CHECKPOINTS.filter(([label, mins]) => curve[label] != null && mins !== MARKET_TOTAL_MIN)
        .map(([label, mins]) => [mins, curve[label]]))
      .concat([[MARKET_TOTAL_MIN, 1.0]])
      .sort((a, b) => a[0] - b[0]);
    let frac = interp(points, elapsedNow);
    if (frac == null) frac = elapsedNow < points[0][0] ? points[0][1] : points[points.length - 1][1];
    if (frac > 0) return [Math.round((revenueNow / frac) * 100) / 100, method];
  }

  return [Math.round((revenueNow * MARKET_TOTAL_MIN / elapsedNow) * 100) / 100, 'linear'];
}

// ── GitHub raw proxy (history / share — unchanged, slow-moving files) ──────

async function fetchGithubFile(filename, pat) {
  const ghRes = await fetch(`${REPO_RAW}/${filename}`, {
    headers: { 'Authorization': `token ${pat}`, 'Accept': 'application/json', 'User-Agent': 'nse-cloud-pipeline-dashboard' },
  });
  if (!ghRes.ok) throw new Error(`GitHub returned ${ghRes.status} for ${filename}`);
  return ghRes.json();
}

// ── Supabase REST query ─────────────────────────────────────────────────────

async function fetchTodaySnapshots(exchange, startUTC, endUTC) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_KEY not set');

  const table = `${exchange}_live_snapshots`;
  const qs = new URLSearchParams({
    select: 'captured_at,revenue,has_data',
    captured_at: `gte.${startUTC.toISOString()}`,
    order: 'captured_at.asc',
  });
  // PostgREST needs captured_at twice (two separate filters) — URLSearchParams
  // collapses repeated keys if set() is used twice, so append the second by hand.
  const fullUrl = `${url}/rest/v1/${table}?${qs.toString()}&captured_at=lt.${endUTC.toISOString()}`;

  const res = await fetch(fullUrl, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`Supabase returned ${res.status} for ${table}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

function rowsToSamples(rows) {
  return rows
    .filter(r => r.has_data && r.revenue)
    .map(r => {
      const capturedIST = toIST(new Date(r.captured_at));
      const elapsed = capturedIST.getUTCHours() * 60 + capturedIST.getUTCMinutes() - MARKET_OPEN_MIN;
      return {
        captured_ist:    capturedIST.toISOString().slice(0, 19),
        elapsed_minutes: elapsed,
        total_revenue:   Math.round((Number(r.revenue.total_revenue) || 0) * 100) / 100,
        cash_revenue:    Math.round((Number(r.revenue.cash_revenue) || 0) * 100) / 100,
        options_revenue: Math.round((Number(r.revenue.options_revenue) || 0) * 100) / 100,
        futures_revenue: Math.round((Number(r.revenue.futures_revenue) || 0) * 100) / 100,
      };
    })
    .filter(s => s.elapsed_minutes > 0)
    .sort((a, b) => a.elapsed_minutes - b.elapsed_minutes);
}

async function buildHourly(exchange, pat) {
  const nowUTC = new Date();
  const { dateStr, startUTC, endUTC } = todayISTRangeUTC(nowUTC);
  const weekday = toIST(nowUTC).getUTCDay() === 0 ? 6 : toIST(nowUTC).getUTCDay() - 1;
  const dayType = classifyDay(toIST(nowUTC), exchange);

  const [rows, historyData] = await Promise.all([
    fetchTodaySnapshots(exchange, startUTC, endUTC),
    fetchGithubFile(GITHUB_FILE_MAP.history(exchange), pat).catch(() => ({ days: [] })),
  ]);

  const samples = rowsToSamples(rows);
  const historyDays = historyData.days || [];
  samples.forEach(s => {
    const [pred, method] = predictEodLive(s.elapsed_minutes, s.total_revenue, historyDays, dayType, weekday);
    s.predicted_eod = pred;
    s.pred_method   = method;
  });

  return { date: dateStr, weekday, weekday_name: WEEKDAY_NAMES[weekday], day_type: dayType, samples };
}

async function buildLive(exchange) {
  const nowUTC = new Date();
  const { startUTC, endUTC } = todayISTRangeUTC(nowUTC);
  const rows = await fetchTodaySnapshots(exchange, startUTC, endUTC);
  const todays = rows.filter(r => r.has_data && r.revenue);
  if (!todays.length) return { updated_at: null, revenue: null };
  const latest = todays[todays.length - 1];
  return { updated_at: latest.captured_at, revenue: latest.revenue };
}

// ── Handler ──────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  const exchange = (req.query.exchange || 'nse').toLowerCase();
  const file     = (req.query.file     || 'live').toLowerCase();

  if (file === 'debug') {
    const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
    const r = await fetch(`${url}/rest/v1/codex_live_snapshots?select=*&order=captured_at.desc&limit=3`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return res.status(200).json(await r.json());
  }

  if (!VALID_EXCHANGES.includes(exchange) || !['live', 'hourly', 'history', 'share'].includes(file)) {
    return res.status(400).json({ error: 'Invalid exchange or file param' });
  }

  const pat = process.env.GITHUB_READ_PAT;
  if (!pat) return res.status(500).json({ error: 'GITHUB_READ_PAT env var not set' });

  try {
    let data;
    if (file === 'live') {
      data = await buildLive(exchange);
    } else if (file === 'hourly') {
      data = await buildHourly(exchange);
    } else {
      data = await fetchGithubFile(GITHUB_FILE_MAP[file](exchange), pat);
    }

    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
};
