"""Tests for the forecast layer (scripts/forecast, scripts/market_calendar.py)."""

import json
from datetime import date, timedelta

import numpy as np
import pandas as pd
import pytest

import market_calendar as mc
from forecast import adr_forecast as af
from forecast import common, vix_activity


def synthetic_df(n=420, seed=0, start="2025-09-01"):
    """Business days with a weekly expiry cycle, multiplicative day effects,
    regime C, and a VIX path that drives activity by bucket."""
    rng = np.random.default_rng(seed)
    days = pd.bdate_range(start, periods=n)
    types, keys = common.calendar_keys("bse", days)
    mult = {"dte0": 3.0, "dte1": 1.5, "dte2": 0.6, "dte3": 0.6, "dte4": 0.6}
    vix = np.empty(n)
    vix[0] = 14.0
    for i in range(1, n):    # mean-reverting like India VIX (half-life ~ 25 days)
        vix[i] = 14 + 0.973 * (vix[i - 1] - 14) + rng.normal(0, 0.9)
    vix = np.clip(vix, 9, 30)
    level = 20 * np.exp(np.cumsum(rng.normal(0, 0.01, n)))
    rev = level * np.array([mult[k] for k in keys]) * np.exp(rng.normal(0, 0.15, n))
    df = pd.DataFrame({"rev": rev, "vix": vix, "key": keys, "day_type": types,
                       "regime": "C", "contracts": rev * 1e6, "opt_rev": rev * 0.9},
                      index=days)
    return df


# ── calendar ─────────────────────────────────────────────────

def test_holiday_shifts_expiry_to_previous_trading_day():
    # NSE weekly expiry is Tuesday from 2025-09-01; 2026-10-20 (Tue) is a holiday
    days = mc.trading_days_between("2026-10-19", "2026-10-23", ["2026-10-20"])
    labels = mc.label_day_types("nse", days)
    assert labels[date(2026, 10, 19)] == "expiry"
    assert all(v != "expiry" for d, v in labels.items() if d != date(2026, 10, 19))


def test_bse_expiry_schedule_by_regime():
    assert mc.expiry_weekday("bse", "2024-06-03") == 4   # Friday
    assert mc.expiry_weekday("bse", "2025-03-03") == 1   # Tuesday
    assert mc.expiry_weekday("bse", "2026-10-12") == 3   # Thursday


def test_listed_expiries_override_rule():
    days = mc.trading_days_between("2026-11-02", "2026-11-06", [])
    labels = mc.label_day_types("nse", days, listed_expiries=["2026-11-05"])
    assert labels[date(2026, 11, 5)] == "expiry"
    assert labels[date(2026, 11, 3)] != "expiry"


def test_pre_expiry_and_dte_keys():
    days = pd.bdate_range("2026-10-05", "2026-10-09")       # Mon..Fri, BSE Thu expiry
    types, keys = common.calendar_keys("bse", days)
    assert types == ["normal", "normal", "pre_expiry", "expiry", "normal"]
    assert keys[:4] == ["dte3", "dte2", "dte1", "dte0"]


# ── 45-DMA arithmetic ────────────────────────────────────────

def test_ma45_path_with_perfect_forecast_equals_true_ma():
    rng = np.random.default_rng(1)
    rev = rng.uniform(5, 50, 120)
    T = 90
    path = af.ma45_path(rev[: T + 1], rev[T + 1:], H=20)
    for h in range(1, 21):
        assert path[h - 1] == pytest.approx(rev[T + h - 44: T + h + 1].mean())


# ── no lookahead ────────────────────────────────────────────

def test_backtest_has_no_lookahead():
    df = synthetic_df(n=300)
    cut = 260
    df2 = df.copy()
    df2.iloc[cut:, df2.columns.get_loc("rev")] *= 3.0     # perturb the far future
    orig = af.candidate_models
    af.candidate_models = lambda ex: [("M1", None), ("M2", 10), ("M3", 10), ("M4", 10)]
    try:
        e1 = af.backtest("bse", df, df.index[160], df.index[200])
        e2 = af.backtest("bse", df2, df.index[160], df.index[200])
    finally:
        af.candidate_models = orig
    pos = {d: i for i, d in enumerate(df.index)}
    keep = lambda e: e[e["h"].map(lambda h: isinstance(h, int))
                       & (e["origin"].map(pos) + e["h"].map(lambda h: h if isinstance(h, int) else 0) < cut)]
    a, b = keep(e1).reset_index(drop=True), keep(e2).reset_index(drop=True)
    assert len(a) > 1000
    pd.testing.assert_frame_equal(a, b)


def test_forecast_uses_only_history():
    df = synthetic_df(n=250)
    keys = list(df["key"].iloc[200:220])
    r1, _ = af.forecast_daily(df.iloc[:200], keys, "M3", 10)
    df2 = df.copy()
    df2.iloc[200:, 0] = 1e6
    r2, _ = af.forecast_daily(df2.iloc[:200], keys, "M3", 10)
    np.testing.assert_allclose(r1, r2)


def test_calendar_model_recovers_multipliers():
    df = synthetic_df(n=300)
    m = af.seasonal_multipliers(df)
    assert m["dte0"] / m["dte3"] == pytest.approx(3.0 / 0.6, rel=0.2)


# ── statistics ──────────────────────────────────────────────

def test_dm_test_detects_better_model():
    rng = np.random.default_rng(2)
    base = rng.normal(0, 0.05, 400)
    better = base * 0.5
    stat, p = af.diebold_mariano(better, base, h=1)
    assert stat < 0 and p < 0.01
    stat2, p2 = af.diebold_mariano(base, base + rng.normal(0, 1e-6, 400), h=1)
    assert p2 > 0.05


def test_aci_coverage_close_to_target_on_iid_errors():
    rng = np.random.default_rng(3)
    e = rng.normal(0, 1, 1500)
    periods = np.array(["tune"] * 500 + ["test"] * 1000)
    _, hits = af.aci_run(e, periods, lag=1, target=0.8)
    assert abs(np.mean(hits["test"]) - 0.8) < 0.04


# ── VIX buckets ─────────────────────────────────────────────

def test_vix_bucket_relatives_recover_known_effect():
    df = synthetic_df(n=420, seed=4)
    boost = np.where(df["vix"] >= 20, 1.4, np.where(df["vix"] < 13, 0.85, 1.0))
    df["rev"] = df["rev"] * boost
    out = vix_activity.bucket_tables("bse", df)
    tab = out["C"]["buckets"]
    assert sum(r["days"] for r in tab.values()) == out["C"]["days"]
    hi = tab["≥20"]["adj"]["rev"]
    lo = tab["11–13"]["adj"]["rev"]
    assert hi["rel"] / lo["rel"] == pytest.approx(1.4 / 0.85, rel=0.12)
    assert hi["rel_ci95"][0] <= 1.4 / 0.85 * lo["rel"] <= hi["rel_ci95"][1] * 1.05


def test_bucket_of_edges():
    assert vix_activity.bucket_of(10.99) == "<11"
    assert vix_activity.bucket_of(11.0) == "11–13"
    assert vix_activity.bucket_of(20.0) == "≥20"


# ── scenario math vs regression output ──────────────────────

@pytest.mark.parametrize("ex", ["bse", "mcx"])
def test_regression_reproduces_latest_prediction(ex):
    path = common.DATA_DIR / f"{ex}_share_analysis.json"
    sa = json.load(open(path))
    reg, latest = sa["regression"], sa["latest"]
    pred = reg["slope"] * latest["rev_ma"] + reg["intercept"]
    assert pred == pytest.approx(latest["price_pred"], abs=1.0)
