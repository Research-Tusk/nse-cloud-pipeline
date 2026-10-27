"""
Trading activity by India VIX level.

For each exchange (NSE, BSE), regime set and VIX bucket:
  raw  mean of each activity metric and the number of days
  rel  level effect of the bucket from a fixed-effects regression

       log(metric_t) = trend_t + regime FE + expiry-cycle FE + VIX-bucket FE + e_t

       trend_t is piecewise linear with knots every 120 trading days (absorbs growth
       such as BSE's several-fold rise without absorbing multi-week VIX episodes).
       rel = exp(bucket FE) normalised so the day-weighted average over the sample is 1;
       rel(b1) / rel(b0) is the expected activity change when VIX moves from b0 to b1.
       CIs: cluster bootstrap resampling consecutive-day runs within a bucket (VIX
       regimes persist, so days are not independent).

A ratio-to-trailing-average adjustment was tried first and rejected: the trailing
baseline already contains the persistent VIX episode, so it understated a known
synthetic effect by ~60% (see tests/test_forecast.py).

Plus a VIX bucket transition matrix for 5/10/20 trading days and average run
lengths, to judge how long a VIX level typically persists.
"""

import numpy as np
import pandas as pd

BUCKETS = [(0, 11), (11, 13), (13, 15), (15, 17), (17, 20), (20, 999)]
REGIME_SETS = {"A": ["A"], "B": ["B"], "C": ["C"], "BC": ["B", "C"], "ALL": ["A", "B", "C"]}
KNOT_EVERY = 120
N_BOOT = 300
LOW_CONF_DAYS = 20

METRICS = {
    "nse": ["rev", "opt_rev", "contracts", "io_contracts", "so_contracts", "if_contracts",
            "sf_contracts", "opt_notional", "opt_premium", "io_premium", "pn_bp"],
    "bse": ["rev", "opt_rev", "contracts", "opt_notional", "opt_premium", "pn_bp"],
}


def bucket_label(lo, hi):
    if lo == 0:
        return f"<{hi}"
    if hi >= 999:
        return f"≥{lo}"
    return f"{lo}–{hi}"


def bucket_of(v):
    for lo, hi in BUCKETS:
        if lo <= v < hi:
            return bucket_label(lo, hi)
    return None


BUCKET_LABELS = [bucket_label(lo, hi) for lo, hi in BUCKETS]


def _design(sub, buckets_present):
    """Design matrix: const, piecewise-linear trend, regime FE, key FE, bucket FE."""
    t = sub["pos"].values.astype(float)
    t = t - t.min()
    cols = [np.ones(len(sub)), t / 100.0]
    for k in np.arange(KNOT_EVERY, t.max(), KNOT_EVERY):
        cols.append(np.maximum(0.0, t - k) / 100.0)
    for r in sorted(sub["regime"].unique())[1:]:
        cols.append((sub["regime"].values == r).astype(float))
    for k in sorted(sub["key"].unique())[1:]:
        cols.append((sub["key"].values == k).astype(float))
    n_ctrl = len(cols)
    for b in buckets_present[1:]:
        cols.append((sub["bucket"].values == b).astype(float))
    return np.column_stack(cols), n_ctrl


def _bucket_rel(sub, y, buckets_present):
    X, n_ctrl = _design(sub, buckets_present)
    beta, *_ = np.linalg.lstsq(X, y, rcond=None)
    fe = {buckets_present[0]: 0.0}
    for i, b in enumerate(buckets_present[1:]):
        fe[b] = float(beta[n_ctrl + i])
    w = sub["bucket"].value_counts(normalize=True)
    norm = sum(np.exp(fe[b]) * w.get(b, 0) for b in buckets_present)
    return {b: float(np.exp(fe[b]) / norm) for b in buckets_present}


def _runs(sub):
    """Cluster ids: consecutive trading days in the same bucket."""
    b, pos = sub["bucket"].values, sub["pos"].values
    ids, cur = np.zeros(len(sub), int), 0
    for i in range(1, len(sub)):
        if b[i] != b[i - 1] or pos[i] != pos[i - 1] + 1:
            cur += 1
        ids[i] = cur
    return ids


def level_effects(sub, metric, rng):
    ok = sub[metric].notna() & (sub[metric] > 0)
    s = sub[ok]
    if len(s) < 60:
        return None
    present = [b for b in BUCKET_LABELS if (s["bucket"] == b).sum() >= 5]
    s = s[s["bucket"].isin(present)]
    y = np.log(s[metric].values.astype(float))
    point = _bucket_rel(s, y, present)
    runs = _runs(s)
    groups = [np.where(runs == r)[0] for r in np.unique(runs)]
    boots = {b: [] for b in present}
    for _ in range(N_BOOT):
        idx = np.concatenate([groups[i] for i in rng.integers(0, len(groups), len(groups))])
        sb = s.iloc[idx]
        if any((sb["bucket"] == b).sum() == 0 for b in present):
            continue
        rel = _bucket_rel(sb, y[idx], present)
        for b in present:
            boots[b].append(rel[b])
    out = {}
    for b in present:
        bb = np.array(boots[b])
        out[b] = {"rel": round(point[b], 4), "n": int((s["bucket"] == b).sum()),
                  "rel_ci80": [round(float(np.quantile(bb, .1)), 4), round(float(np.quantile(bb, .9)), 4)]
                  if len(bb) > 50 else None,
                  "rel_ci95": [round(float(np.quantile(bb, .025)), 4), round(float(np.quantile(bb, .975)), 4)]
                  if len(bb) > 50 else None}
    return out


def bucket_tables(ex, df, seed=7):
    rng = np.random.default_rng(seed)
    df = df[df["vix"].notna()].copy()
    df["bucket"] = df["vix"].map(bucket_of)
    df["pos"] = np.arange(len(df))
    metrics = [m for m in METRICS[ex] if m in df and df[m].notna().sum() > 0]

    out = {}
    for rs_name, regs in REGIME_SETS.items():
        sub = df[df["regime"].isin(regs)]
        if len(sub) < 60:
            continue
        effects = {m: level_effects(sub, m, rng) for m in metrics}
        table = {}
        for b in BUCKET_LABELS:
            bs = sub[sub["bucket"] == b]
            if len(bs) == 0:
                continue
            row = {"days": int(len(bs)), "low_confidence": len(bs) < LOW_CONF_DAYS,
                   "vix_mean": round(float(bs["vix"].mean()), 2), "raw": {}, "adj": {}}
            for m in metrics:
                v = bs[m].dropna()
                if len(v):
                    row["raw"][m] = round(float(v.mean()), 4)
                e = (effects.get(m) or {}).get(b)
                if e:
                    row["adj"][m] = e
            table[b] = row
        out[rs_name] = {"days": int(len(sub)), "start": str(sub.index.min().date()),
                        "end": str(sub.index.max().date()), "buckets": table}
    return out


def transitions(vix):
    """P(bucket at t+k | bucket at t) and average run length per bucket."""
    b = vix.map(bucket_of).values
    out = {}
    for k in (5, 10, 20):
        m = pd.crosstab(pd.Series(b[:-k], name="from"), pd.Series(b[k:], name="to"),
                        normalize="index")
        m = m.reindex(index=BUCKET_LABELS, columns=BUCKET_LABELS).fillna(0.0)
        out[str(k)] = {fb: {tb: round(float(m.loc[fb, tb]), 4) for tb in BUCKET_LABELS}
                       for fb in BUCKET_LABELS}
    runs = {lb: [] for lb in BUCKET_LABELS}
    cur, n = b[0], 1
    for x in b[1:]:
        if x == cur:
            n += 1
        else:
            runs[cur].append(n)
            cur, n = x, 1
    runs[cur].append(n)
    run_len = {lb: (round(float(np.mean(r)), 1) if r else None) for lb, r in runs.items()}
    return {"matrix": out, "avg_run_days": run_len,
            "days_in_bucket": {lb: int((b == lb).sum()) for lb in BUCKET_LABELS},
            "start": str(vix.index.min().date()), "end": str(vix.index.max().date())}


def vix_summary(ex, df):
    from .common import vix_series
    vix = vix_series()
    cur = float(vix.iloc[-1])
    return {
        "current_vix": round(cur, 2), "current_date": str(vix.index[-1].date()),
        "current_bucket": bucket_of(cur),
        "vix_5d_ago": round(float(vix.iloc[-6]), 2), "vix_20d_ago": round(float(vix.iloc[-21]), 2),
        "buckets_def": BUCKET_LABELS, "metrics": [m for m in METRICS[ex] if m in df],
        "regimes": bucket_tables(ex, df),
        "transitions": transitions(vix),
        "default_regime": "BC",
        "method": "rel = VIX-bucket fixed effect from log(activity) ~ piecewise trend "
                  "(120-day knots) + regime + expiry-cycle + bucket; normalised to a "
                  "day-weighted mean of 1. CIs: cluster bootstrap over consecutive-day runs.",
    }
