"""
Market calendar — trading days, weekly-expiry schedule and day-type labels.

Revenue on NSE/BSE is dominated by the weekly index-option expiry (BSE expiry-day
revenue is ~5x a normal day), so any forward 45-DMA estimate must know which future
days are expiries, pre-expiries and holidays.

Sources (in priority order):
  1. Dhan public scrip master (no auth) — actual listed NIFTY / SENSEX option expiries,
     already shifted for holidays. Covers roughly the next 4-8 weeks.
  2. NSE holiday-master API — trading holidays for the current calendar year.
  3. Rule-based schedule below (weekday by regime, shifted to the previous trading
     day when the scheduled weekday is a holiday).

Historical expiry weekdays were verified against weekly option-revenue peaks in
dashboard/data/{nse,bse}_dashboard_data.json (see EXPIRY_SCHEDULE).

Writes dashboard/data/market_calendar.json when run as a script.
"""

import csv
import io
import json
from datetime import date, datetime, timedelta
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
CALENDAR_PATH = PROJECT_ROOT / "dashboard" / "data" / "market_calendar.json"

SCRIP_MASTER_URL = "https://images.dhan.co/api-data/api-scrip-master.csv"
NSE_HOLIDAY_URL = "https://www.nseindia.com/api/holiday-master?type=trading"

# Weekly-expiry weekday by period (Mon=0 … Fri=4). `None` end = open-ended.
# NSE pre-Nov-2024 had several index expiries per week (BankNifty Wed, FinNifty Tue,
# Midcap Mon); Nifty Thursday was the largest, so it is the primary expiry.
EXPIRY_SCHEDULE = {
    "nse": [
        ("2000-01-01", "2025-08-31", 3),   # Thursday (Nifty weekly)
        ("2025-09-01", None, 1),           # Tuesday
    ],
    "bse": [
        ("2023-05-15", "2024-12-31", 4),   # Friday (Sensex weekly relaunch)
        ("2025-01-01", "2025-08-31", 1),   # Tuesday
        ("2025-09-01", None, 3),           # Thursday
    ],
}
EXPIRY_UNDERLYING = {"nse": "NIFTY", "bse": "SENSEX"}

# Structural regimes in F&O activity.
REGIMES = [
    ("A", "2000-01-01", "2024-11-19", "Pre SEBI F&O framework"),
    ("B", "2024-11-20", "2025-08-31", "SEBI framework (one weekly expiry/exchange)"),
    ("C", "2025-09-01", None, "Expiry days moved (NSE Tue, BSE Thu)"),
]


def _d(s):
    return s if isinstance(s, date) else date.fromisoformat(str(s)[:10])


def regime_of(day):
    ds = _d(day).isoformat()
    for code, start, end, _ in REGIMES:
        if ds >= start and (end is None or ds <= end):
            return code
    return REGIMES[-1][0]


def expiry_weekday(ex, day):
    ds = _d(day).isoformat()
    for start, end, wd in EXPIRY_SCHEDULE.get(ex, []):
        if ds >= start and (end is None or ds <= end):
            return wd
    return None


# ── Fetchers (network; all failures are non-fatal) ─────────────

def fetch_listed_expiries(timeout=60):
    """Upcoming NIFTY / SENSEX option expiries from the public Dhan scrip master.
    Returns {"nse": [iso dates], "bse": [iso dates]} or {} on failure."""
    try:
        import requests
        resp = requests.get(SCRIP_MASTER_URL, timeout=timeout)
        resp.raise_for_status()
        out = {"nse": set(), "bse": set()}
        want = {("NSE", "NIFTY"): "nse", ("BSE", "SENSEX"): "bse"}
        for row in csv.DictReader(io.StringIO(resp.text)):
            if row.get("SEM_INSTRUMENT_NAME") != "OPTIDX":
                continue
            sym = (row.get("SEM_TRADING_SYMBOL") or "").split("-")[0]
            ex = want.get((row.get("SEM_EXM_EXCH_ID"), sym))
            if ex:
                out[ex].add(row["SEM_EXPIRY_DATE"][:10])
        return {k: sorted(v) for k, v in out.items()}
    except Exception as e:
        print(f"WARNING: scrip master expiry fetch failed (non-fatal): {e}")
        return {}


def fetch_nse_holidays():
    """Trading holidays (F&O segment) for the current year from NSE. [] on failure."""
    try:
        from curl_cffi import requests as cffi_requests
        s = cffi_requests.Session()
        s.get("https://www.nseindia.com/", impersonate="chrome", timeout=30)
        j = s.get(NSE_HOLIDAY_URL, impersonate="chrome", timeout=30).json()
        rows = j.get("FO") or j.get("CM") or []
        return sorted(datetime.strptime(r["tradingDate"], "%d-%b-%Y").date().isoformat()
                      for r in rows)
    except Exception as e:
        print(f"WARNING: NSE holiday fetch failed (non-fatal): {e}")
        return []


def load_calendar():
    if CALENDAR_PATH.exists():
        with open(CALENDAR_PATH) as f:
            return json.load(f)
    return {"holidays": [], "listed_expiries": {}}


def refresh_calendar():
    """Fetch holidays + listed expiries, merge with the cached file (keeps past
    holidays across year boundaries) and write market_calendar.json."""
    cal = load_calendar()
    holidays = set(cal.get("holidays", [])) | set(fetch_nse_holidays())
    listed = fetch_listed_expiries() or cal.get("listed_expiries", {})
    cal = {
        "updated_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "holidays": sorted(holidays),
        "listed_expiries": listed,
        "expiry_schedule": EXPIRY_SCHEDULE,
        "regimes": [{"code": c, "start": s, "end": e, "label": l} for c, s, e, l in REGIMES],
    }
    CALENDAR_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CALENDAR_PATH, "w") as f:
        json.dump(cal, f, indent=1)
    print(f"Wrote {CALENDAR_PATH}: {len(cal['holidays'])} holidays, "
          f"listed expiries nse={len(listed.get('nse', []))} bse={len(listed.get('bse', []))}")
    return cal


# ── Trading days and day types ─────────────────────────────────

def future_trading_days(after, n, holidays):
    """Next n weekdays strictly after `after` that are not holidays."""
    hol = set(holidays)
    out, d = [], _d(after)
    while len(out) < n:
        d += timedelta(days=1)
        if d.weekday() < 5 and d.isoformat() not in hol:
            out.append(d)
    return out


def trading_days_between(start, end, holidays):
    """Weekdays in [start, end] that are not holidays."""
    hol = set(holidays)
    out, d = [], _d(start)
    end = _d(end)
    while d <= end:
        if d.weekday() < 5 and d.isoformat() not in hol:
            out.append(d)
        d += timedelta(days=1)
    return out


def label_day_types(ex, trading_days, listed_expiries=None):
    """Label each trading day 'expiry' / 'pre_expiry' / 'normal'.

    trading_days: sorted list of dates (historical actual days and/or projected days).
    For each ISO week the expiry is the scheduled weekday, or — if that day is not a
    trading day — the last trading day before it in the same week. Listed expiries
    (from the scrip master) override the rule for the weeks they cover.
    Pre-expiry = the trading day immediately before an expiry.
    """
    days = sorted(_d(x) for x in trading_days)
    day_set = set(days)
    listed = {_d(x) for x in (listed_expiries or [])}
    listed_weeks = {x.isocalendar()[:2] for x in listed}

    by_week = {}
    for d in days:
        by_week.setdefault(d.isocalendar()[:2], []).append(d)

    expiries = set()
    for wk, wdays in by_week.items():
        if wk in listed_weeks:
            expiries |= {x for x in listed if x.isocalendar()[:2] == wk and x in day_set}
            continue
        wd = expiry_weekday(ex, wdays[0])
        if wd is None:
            continue
        candidates = [x for x in wdays if x.weekday() <= wd]
        if candidates:
            expiries.add(max(candidates))

    labels = {}
    for i, d in enumerate(days):
        if d in expiries:
            labels[d] = "expiry"
        elif i + 1 < len(days) and days[i + 1] in expiries:
            labels[d] = "pre_expiry"
        else:
            labels[d] = "normal"
    return labels


if __name__ == "__main__":
    refresh_calendar()
