"""
45-DMA path and quarter-end ADR forecasting with walk-forward backtest.

Every model produces a daily revenue forecast rev_hat[j] for the next trading days;
the forecast 45-DMA at T+h is then

    MA45(T+h) = ( sum of actual revenue still inside the window  +  sum rev_hat[1..h] ) / 45

Models
  M0  carry today's 45-DMA forward (flat fill)
  M1  carry today's 20-DMA forward (flat fill)                    ← baseline to beat
  M2  calendar-aware: rev_hat = L_T · m[key]; m = expiry-cycle multipliers estimated
      on the current regime (shrunk toward the previous one), L_T = EWMA of the
      de-seasonalised series s_t = rev_t / m[key_t]
  M3  M2 · exp(adj) where adj = b·[1, log(s5/s20), log(s20/s45)] is fitted on the
      past (does recent momentum persist or mean-revert over the next 20 days?)
  M4  M3 + VIX state feature log(VIX_T / VIX 45d mean)   (NSE/BSE only)

Intervals are conformal: empirical quantiles of walk-forward log errors that were
already resolved at the forecast origin (no lookahead), with Adaptive Conformal
Inference (Gibbs & Candès 2021) adjusting the quantile level online from realised
misses, so coverage holds under drift (plain conformal under-covered by 5-15pp
in the 2025-26 test period; ACI with gamma=0.01 was chosen on the tuning period).
"""

import math

import numpy as np
import pandas as pd

H_MAX = 20                  # 45-DMA path horizon (trading days)
MA_WIN = 45
CONFORMAL_LOOKBACK = 250    # resolved errors used for each interval
MIN_ERRORS = 40
MULT_WINDOW = 120           # days of current regime used for multipliers
SHRINK = 20                 # pseudo-observations pulling multipliers to prior regime
ADJ_TRAIN = 250             # past origins used to fit the M3/M4 adjustment
ADJ_RIDGE = 5.0
ADJ_CLIP = 0.25
HALFLIVES = (5, 10, 20)
ACI_GAMMA = 0.01
QE_BUCKETS = [(1, 5), (6, 10), (11, 20), (21, 40), (41, 80)]


# ── Model components ──────────────────────────────────────────

def seasonal_multipliers(hist):
    """Multiplier per seasonal key (mean rev of key / mean rev), current regime
    shrunk toward the most recent prior-regime window; normalised to mean 1."""
    cur_reg = hist["regime"].iloc[-1]
    cur = hist[hist["regime"] == cur_reg].tail(MULT_WINDOW)
    prev = hist[hist["regime"] != cur_reg].tail(MULT_WINDOW)

    def ratios(h):
        if len(h) < 10:
            return {}, {}
        g = h.groupby("key")["rev"]
        return (g.mean() / h["rev"].mean()).to_dict(), g.size().to_dict()

    mc, nc = ratios(cur)
    mp, _ = ratios(prev)
    m = {}
    for k in set(mc) | set(mp):
        n = nc.get(k, 0)
        if k in mc and k in mp:
            m[k] = (n * mc[k] + SHRINK * mp[k]) / (n + SHRINK)
        else:
            m[k] = mc.get(k, mp.get(k, 1.0))
    base = cur if len(cur) >= 10 else hist.tail(MULT_WINDOW)
    freq = base["key"].value_counts(normalize=True)
    norm = sum(m.get(k, 1.0) * f for k, f in freq.items()) or 1.0
    return {k: v / norm for k, v in m.items()}


def _features(s, vix, use_vix):
    """Momentum (+ VIX state) feature matrix aligned to s.index."""
    s5, s20, s45 = (s.rolling(w).mean() for w in (5, 20, 45))
    cols = [np.log(s5 / s20), np.log(s20 / s45)]
    if use_vix:
        cols.append(np.log(vix / vix.rolling(45, min_periods=20).mean()))
    X = pd.concat(cols, axis=1)
    X.insert(0, "const", 1.0)
    return X


def fit_adjustment(s, level, vix, use_vix, horizon=20):
    """Ridge fit of y_t = log(mean(s[t+1..t+h]) / L_t) on features at t.
    Uses only origins whose target is fully observed inside `s`."""
    X = _features(s, vix, use_vix)
    fwd = s[::-1].rolling(horizon).mean()[::-1].shift(-1)
    y = np.log(fwd / level)
    ok = X.notna().all(axis=1) & y.notna()
    Xo, yo = X[ok].tail(ADJ_TRAIN).values, y[ok].tail(ADJ_TRAIN).values
    if len(yo) < 60:
        return None, X
    P = np.eye(Xo.shape[1]) * ADJ_RIDGE
    P[0, 0] = 0.0
    b = np.linalg.solve(Xo.T @ Xo + P, Xo.T @ yo)
    return b, X


def forecast_daily(hist, fut_keys, model, halflife=10):
    """Daily revenue forecast for the future keys (list) using data in `hist` only."""
    rev = hist["rev"]
    n = len(fut_keys)
    if model == "M0":
        return np.full(n, rev.tail(MA_WIN).mean()), {}
    if model == "M1":
        return np.full(n, rev.tail(20).mean()), {}

    m = seasonal_multipliers(hist)
    s = rev / hist["key"].map(m).fillna(1.0)
    level_series = s.ewm(halflife=halflife, adjust=True).mean()
    L = float(level_series.iloc[-1])
    adj, info = 0.0, {"multipliers": m, "level": L}
    if model in ("M3", "M4"):
        b, X = fit_adjustment(s, level_series, hist["vix"], model == "M4")
        if b is not None and X.iloc[-1].notna().all():
            adj = float(np.clip(X.iloc[-1].values @ b, -ADJ_CLIP, ADJ_CLIP))
            info["adj_coef"] = b.tolist()
    info["adj"] = adj
    mult = np.array([m.get(k, 1.0) for k in fut_keys])
    return L * math.exp(adj) * mult, info


def ma45_path(actual_rev, rev_hat, H=H_MAX):
    """Forecast MA45 at T+1..T+H from the actual series up to T and daily forecasts."""
    a = np.asarray(actual_rev, float)
    out = []
    for h in range(1, H + 1):
        keep = a[len(a) - (MA_WIN - h):] if h < MA_WIN else a[:0]
        out.append((keep.sum() + rev_hat[:min(h, MA_WIN)].sum()) / MA_WIN
                   if h <= MA_WIN else rev_hat[h - MA_WIN:h].mean())
    return np.array(out)


# ── Statistics helpers ────────────────────────────────────────

def _norm_cdf(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))


def diebold_mariano(e_model, e_base, h):
    """DM test on absolute log errors (HLN small-sample correction, Newey-West
    variance with lag h-1). Negative stat = model better. Returns (stat, p two-sided)."""
    d = np.abs(np.asarray(e_model)) - np.abs(np.asarray(e_base))
    d = d[~np.isnan(d)]
    n = len(d)
    if n < 30:
        return None, None
    dc = d - d.mean()
    lrv = dc @ dc / n
    for k in range(1, h):
        lrv += 2 * (1 - k / h) * (dc[k:] @ dc[:-k]) / n
    if lrv <= 0:
        return None, None
    stat = d.mean() / math.sqrt(lrv / n)
    stat *= math.sqrt(max((n + 1 - 2 * h + h * (h - 1) / n) / n, 1e-9))
    return float(stat), float(2 * (1 - _norm_cdf(abs(stat))))


def conformal_band(errors, point, levels=(0.8, 0.95), alphas=None):
    """Multiplicative band from log errors log(actual/forecast). `alphas` optionally
    overrides the miscoverage level per target level (from ACI)."""
    e = np.asarray(errors, float)
    if len(e) < MIN_ERRORS:
        return {}
    out = {}
    for lv in levels:
        a = (alphas or {}).get(lv, 1 - lv)
        lo, hi = np.quantile(e, [a / 2, 1 - a / 2])
        tag = int(lv * 100)
        out[f"lo{tag}"] = point * math.exp(lo)
        out[f"hi{tag}"] = point * math.exp(hi)
    return out


def aci_run(log_errs, periods, lag, target, gamma=ACI_GAMMA):
    """Walk through origins in order; at each, build the band from errors resolved
    `lag` origins earlier using the current ACI alpha, record hit/miss, and feed the
    miss back once it resolves. Returns (final alpha, hits by period)."""
    a = 1 - target
    hits = {"tune": [], "test": []}
    pending = []
    for j in range(len(log_errs)):
        while pending and pending[0][0] <= j:
            _, miss = pending.pop(0)
            a = min(max(a + gamma * ((1 - target) - miss), 0.005), 0.6)
        past = log_errs[: max(0, j - lag + 1)][-CONFORMAL_LOOKBACK:]
        if len(past) < MIN_ERRORS:
            continue
        lo, hi = np.quantile(past, [a / 2, 1 - a / 2])
        hit = lo <= log_errs[j] <= hi
        pending.append((j + lag, 0.0 if hit else 1.0))
        hits[periods[j]].append(hit)
    while pending:   # remaining misses resolve after the last origin
        _, miss = pending.pop(0)
        a = min(max(a + gamma * ((1 - target) - miss), 0.005), 0.6)
    return a, hits


def qe_bucket(days_left):
    for lo, hi in QE_BUCKETS:
        if lo <= days_left <= hi:
            return f"{lo}-{hi}"
    return None


# ── Walk-forward backtest ─────────────────────────────────────

def candidate_models(ex):
    models = [("M0", None), ("M1", None)]
    for hl in HALFLIVES:
        models += [("M2", hl), ("M3", hl)]
        if ex != "mcx":
            models.append(("M4", hl))
    return models


def model_name(model, hl):
    return model if hl is None else f"{model}_hl{hl}"


def backtest(ex, df, eval_start, tune_end):
    """Walk-forward over every trading-day origin from eval_start.
    Returns a long DataFrame of errors: origin, model, h, log_err, ape, period."""
    from .common import fy_quarter_bounds

    rev = df["rev"].values
    keys = df["key"].values
    dates = df.index
    q_end_idx = {}
    for i, d in enumerate(dates):
        qs, qe = fy_quarter_bounds(d)
        q_end_idx.setdefault((qs, qe), []).append(i)

    origins = [i for i, d in enumerate(dates) if d >= pd.Timestamp(eval_start) and i >= 150]
    models = candidate_models(ex)
    recs = []
    for i in origins:
        hist = df.iloc[: i + 1]
        qs, qe = fy_quarter_bounds(dates[i])
        q_idx = q_end_idx[(qs, qe)]
        q_last = q_idx[-1]
        q_complete = q_last < len(dates) - 1 or dates[-1] >= qe - pd.Timedelta(days=3)
        n_fut = max(H_MAX, q_last - i)
        n_fut = min(n_fut, len(rev) - 1 - i)
        if n_fut <= 0:
            continue
        fut_keys = list(keys[i + 1: i + 1 + n_fut])
        period = "tune" if dates[i] < pd.Timestamp(tune_end) else "test"
        for model, hl in models:
            rh, _ = forecast_daily(hist, fut_keys, model, hl or 10)
            path = ma45_path(rev[: i + 1], rh, min(H_MAX, n_fut))
            name = model_name(model, hl)
            for h, ma_hat in enumerate(path, start=1):
                ma_true = rev[i + h - MA_WIN + 1: i + h + 1].mean()
                recs.append((dates[i], name, h, math.log(ma_true / ma_hat),
                             abs(ma_hat / ma_true - 1), period))
            # quarter-end ADR
            days_left = q_last - i
            if days_left >= 1 and q_complete and days_left <= n_fut:
                q0 = q_idx[0]
                actual = rev[q0: q_last + 1].mean()
                fc = (rev[q0: i + 1].sum() + rh[:days_left].sum()) / (q_last - q0 + 1)
                recs.append((dates[i], name, f"qe:{qe_bucket(days_left)}",
                             math.log(actual / fc), abs(fc / actual - 1), period))
    return pd.DataFrame(recs, columns=["origin", "model", "h", "log_err", "ape", "period"])


def coverage_walkforward(errs, model, h, levels=(0.8, 0.95)):
    """Test-period coverage of ACI conformal bands, plus the final ACI alphas."""
    e = errs[(errs["model"] == model) & (errs["h"] == h)].sort_values("origin")
    le, periods = e["log_err"].values, e["period"].values
    lag = h if isinstance(h, int) else 62
    out, alphas = {}, {}
    for lv in levels:
        a, hits = aci_run(le, periods, lag, lv)
        alphas[lv] = a
        out[f"cov{int(lv * 100)}"] = float(np.mean(hits["test"])) if hits["test"] else None
    out["alphas"] = alphas
    return out


def summarise_backtest(errs, ex):
    """Per model × horizon metrics on the test period, tuned half-life per model
    family, DM tests vs M1, and the promotion decision."""
    test = errs[errs["period"] == "test"]
    tune = errs[errs["period"] == "tune"]
    int_h = [h for h in range(1, H_MAX + 1)]

    # choose half-life per family on the tuning period (avg MAPE over h=5,10,20)
    chosen = {}
    for fam in ("M2", "M3", "M4"):
        cands = sorted({m for m in errs["model"].unique() if m.startswith(fam + "_")})
        if not cands:
            continue
        score = {m: tune[(tune["model"] == m) & tune["h"].isin([5, 10, 20])]["ape"].mean()
                 for m in cands}
        score = {m: v for m, v in score.items() if not math.isnan(v)}
        chosen[fam] = min(score, key=score.get) if score else cands[0]
    finalists = ["M0", "M1"] + [chosen[f] for f in ("M2", "M3", "M4") if f in chosen]

    by_model = {}
    for m in finalists:
        e = test[test["model"] == m]
        row = {"n_origins": int(e[e["h"] == 1].shape[0])}
        for h in (1, 5, 10, 20):
            eh = e[e["h"] == h]
            row[f"mape_h{h}"] = float(eh["ape"].mean()) if len(eh) else None
            row[f"bias_h{h}"] = float(eh["log_err"].mean()) if len(eh) else None
            row[f"p90_h{h}"] = float(eh["ape"].quantile(0.9)) if len(eh) else None
        qe = e[e["h"].astype(str).str.startswith("qe:")]
        row["mape_qe"] = {b: float(g["ape"].mean()) for b, g in qe.groupby("h")}
        for h in (5, 10, 20):
            cov = coverage_walkforward(errs, m, h)
            row[f"cov80_h{h}"], row[f"cov95_h{h}"] = cov["cov80"], cov["cov95"]
        if m != "M1":
            for h in (5, 10, 20):
                a = test[(test["model"] == m) & (test["h"] == h)].set_index("origin")["log_err"]
                b = test[(test["model"] == "M1") & (test["h"] == h)].set_index("origin")["log_err"]
                j = a.index.intersection(b.index)
                stat, p = diebold_mariano(a[j].values, b[j].values, h)
                row[f"dm_h{h}"], row[f"dm_p_h{h}"] = stat, p
        by_model[m] = row

    base = by_model["M1"]
    promoted, reasons = "M1", []
    best = None
    for m in finalists:
        if m in ("M0", "M1"):
            continue
        r = by_model[m]
        gains = [1 - r[f"mape_h{h}"] / base[f"mape_h{h}"] for h in (10, 20)]
        ok_gain = all(g >= 0.10 for g in gains)
        ok_dm = all((r.get(f"dm_p_h{h}") is not None and r[f"dm_p_h{h}"] < 0.05
                     and r[f"dm_h{h}"] < 0) for h in (10, 20))
        cov = r.get("cov80_h20")
        ok_cov = cov is not None and abs(cov - 0.80) <= 0.05
        reasons.append({"model": m, "mape_gain_h10": gains[0], "mape_gain_h20": gains[1],
                        "dm_ok": ok_dm, "coverage_ok": ok_cov, "pass": ok_gain and ok_dm and ok_cov})
        if ok_gain and ok_dm and ok_cov:
            score = sum(r[f"mape_h{h}"] for h in (10, 20))
            if best is None or score < best[0]:
                best = (score, m)
    if best:
        promoted = best[1]
    return {
        "test_start": str(test["origin"].min().date()) if len(test) else None,
        "test_end": str(test["origin"].max().date()) if len(test) else None,
        "tuned_halflife": chosen,
        "by_model": by_model,
        "promotion": {"rule": "≥10% lower MAPE than M1 at h=10 and h=20, DM p<0.05, "
                              "80% interval coverage within ±5pp",
                      "checks": reasons, "selected": promoted},
        "mape_by_h": {m: [float(test[(test["model"] == m) & (test["h"] == h)]["ape"].mean())
                          for h in int_h] for m in finalists},
    }


# ── Live forecast ─────────────────────────────────────────────

def live_forecast(ex, df, model_full, errs):
    """Forecast from the last available day with conformal bands from the
    selected model's most recent resolved errors."""
    from .common import future_calendar, fy_quarter_bounds, fy_quarter_label

    fam, hl = (model_full.split("_hl") + [None])[:2]
    hl = int(hl) if hl else 10
    last = df.index[-1]
    qs, qe = fy_quarter_bounds(last)
    fut = future_calendar(ex, last, 80, list(df.index))
    q_days = fut[fut.index <= qe]
    n_fut = max(H_MAX, len(q_days))
    fut = fut.iloc[:n_fut]
    rh, info = forecast_daily(df, list(fut["key"]), fam, hl)

    rev = df["rev"].values
    path = ma45_path(rev, rh, H_MAX)
    e_model = errs[errs["model"] == model_full]
    rows = []
    for h in range(1, H_MAX + 1):
        eh = e_model[e_model["h"] == h].sort_values("origin")["log_err"].values[-CONFORMAL_LOOKBACK:]
        alphas = coverage_walkforward(errs, model_full, h)["alphas"]
        band = conformal_band(eh, path[h - 1], alphas=alphas)
        rows.append({"date": str(fut.index[h - 1].date()), "day_type": fut["day_type"].iloc[h - 1],
                     "rev_hat": round(float(rh[h - 1]), 4), "ma45_hat": round(float(path[h - 1]), 4),
                     **{k: round(v, 4) for k, v in band.items()}})

    q_mask = (df.index >= qs) & (df.index <= qe)
    qtd = df.loc[q_mask, "rev"]
    nl = len(q_days)
    adr_hat = (qtd.sum() + rh[:nl].sum()) / (len(qtd) + nl) if (len(qtd) + nl) else None
    bucket = qe_bucket(nl)
    # Quarter-end errors from the same quarter are near-duplicates, so the effective
    # sample is the number of distinct past quarters: use all of them, plain conformal.
    qe_rows = e_model[e_model["h"] == f"qe:{bucket}"]
    qe_err = qe_rows["log_err"].values
    n_quarters = int(qe_rows["origin"].map(lambda d: fy_quarter_label(d)).nunique()) if len(qe_rows) else 0
    quarter_end = {
        "quarter": fy_quarter_label(last), "quarter_end": str(qe.date()),
        "days_elapsed": int(len(qtd)), "days_remaining": int(nl),
        "qtd_adr": round(float(qtd.mean()), 4) if len(qtd) else None,
        "adr_hat": round(float(adr_hat), 4) if adr_hat else None,
        "expiries_remaining": int((q_days["day_type"] == "expiry").sum()),
        "band_quarters": n_quarters,
        **({k: round(v, 4) for k, v in conformal_band(qe_err, adr_hat).items()}
           if adr_hat and nl else {}),
    }
    return {"path": rows, "quarter_end": quarter_end, "model_info": {
        "level": round(info.get("level", float("nan")), 4) if "level" in info else None,
        "adj": round(info.get("adj", 0.0), 4),
        "multipliers": {k: round(v, 4) for k, v in (info.get("multipliers") or {}).items()},
    }, "future_keys": list(fut["key"]), "future_dates": [str(d.date()) for d in fut.index],
        "future_day_types": list(fut["day_type"]), "rev_hat_all": [round(float(x), 4) for x in rh]}


def dma_snapshot(df):
    rev = df["rev"]
    out = {}
    for w in (5, 10, 20, 45):
        ma = rev.rolling(w).mean()
        out[f"dma{w}"] = round(float(ma.iloc[-1]), 4)
        out[f"dma{w}_chg5"] = round(float(ma.iloc[-1] / ma.iloc[-6] - 1), 4)
    out["series"] = [{"date": str(d.date()), "rev": round(float(r), 4),
                      **{f"dma{w}": (round(float(v), 4) if not math.isnan(v) else None)
                         for w, v in ((w, rev.rolling(w).mean().loc[d]) for w in (5, 10, 20, 45))}}
                     for d, r in rev.tail(160).items()]
    out["last45"] = [{"date": str(d.date()), "rev": round(float(r), 4)} for d, r in rev.tail(MA_WIN).items()]
    return out
