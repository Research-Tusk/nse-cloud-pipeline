"""
Shared loaders for the forecast layer.

Builds one pandas DataFrame per exchange from dashboard/data/{ex}_dashboard_data.json:
weekday trading days with revenue > 0, joined with India VIX (from the NSE file),
plus calendar features:
  regime    A / B / C (market_calendar.REGIMES)
  day_type  expiry / pre_expiry / normal
  key       seasonal key used by the models: "dte0".."dte4" (trading days to the
            next weekly expiry, capped at 4) for NSE/BSE; weekday name for MCX
"""

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

SCRIPTS_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = SCRIPTS_DIR.parent
DATA_DIR = PROJECT_ROOT / "dashboard" / "data"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import market_calendar as mc  # noqa: E402

# First date with meaningful F&O revenue per exchange (BSE Sensex weekly relaunch).
SERIES_START = {"nse": "2023-04-01", "bse": "2023-06-01", "mcx": "2022-01-01"}

# Unified activity columns per exchange: our name -> source field
ACTIVITY_FIELDS = {
    "nse": {
        "rev": "total_rev", "opt_rev": "opt_rev", "fut_rev": "fut_rev",
        "contracts": "total_contracts",
        "io_contracts": "io_contracts", "so_contracts": "so_contracts",
        "if_contracts": "if_contracts", "sf_contracts": "sf_contracts",
        "opt_notional": ("io_notional", "so_notional"),
        "opt_premium": ("io_premium", "so_premium"),
        "io_notional": "io_notional", "io_premium": "io_premium",
    },
    "bse": {
        "rev": "total_rev", "opt_rev": "opt_rev",
        "contracts": "total_contracts",
        "opt_notional": "options_notional_turnover",
        "opt_premium": "options_premium_turnover",
    },
    "mcx": {"rev": "total_rev", "opt_rev": "opt_rev", "fut_rev": "fut_rev"},
}


def _load_json(name):
    with open(DATA_DIR / name) as f:
        return json.load(f)


def vix_series():
    rows = _load_json("nse_dashboard_data.json")["daily_all"]
    s = pd.Series({r["date"]: float(r.get("vix") or 0) for r in rows})
    s.index = pd.to_datetime(s.index)
    return s[s > 0].sort_index()


def load_daily(ex):
    rows = _load_json(f"{ex}_dashboard_data.json")["daily_all"]
    fields = ACTIVITY_FIELDS[ex]
    recs = []
    for r in rows:
        rec = {"date": r["date"]}
        for name, src in fields.items():
            if isinstance(src, tuple):
                vals = [r.get(s) for s in src]
                rec[name] = None if any(v is None for v in vals) else float(sum(vals))
            else:
                v = r.get(src)
                rec[name] = None if v is None else float(v)
        recs.append(rec)
    df = pd.DataFrame(recs)
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").sort_index()
    df = df[(df.index.weekday < 5) & (df["rev"] > 0) & (df.index >= SERIES_START[ex])]
    df = df[~df.index.duplicated(keep="last")]
    if "opt_premium" in df and "opt_notional" in df:
        df["pn_bp"] = df["opt_premium"] / df["opt_notional"].replace(0, np.nan) * 1e4
    df["vix"] = vix_series().reindex(df.index)
    return add_calendar(ex, df)


def calendar_keys(ex, dates, listed_expiries=None):
    """Return (day_type list, key list) for an ordered sequence of trading dates."""
    dates = [pd.Timestamp(d).date() for d in dates]
    if ex == "mcx":
        return ["normal"] * len(dates), [d.strftime("%a") for d in dates]
    labels = mc.label_day_types(ex, dates, listed_expiries)
    # trading days to next expiry (cap 4); days after the last known expiry get 4
    dte, nxt = [], None
    for d in reversed(dates):
        if labels[d] == "expiry":
            nxt = 0
        elif nxt is not None:
            nxt += 1
        dte.append(min(nxt, 4) if nxt is not None else 4)
    dte.reverse()
    return [labels[d] for d in dates], [f"dte{x}" for x in dte]


def add_calendar(ex, df):
    df = df.copy()
    df["regime"] = [mc.regime_of(d.date()) for d in df.index]
    df["day_type"], df["key"] = calendar_keys(ex, df.index)
    return df


def future_calendar(ex, last_date, n, history_dates=None):
    """Next n trading days after last_date with day_type and key.
    Labels are computed on the last few weeks of history + future so a week that
    straddles last_date is labelled consistently."""
    cal = mc.load_calendar()
    fut = mc.future_trading_days(pd.Timestamp(last_date).date(), n, cal.get("holidays", []))
    hist = [pd.Timestamp(d).date() for d in (history_dates or [])][-10:]
    listed = (cal.get("listed_expiries") or {}).get(ex)
    types, keys = calendar_keys(ex, hist + fut, listed)
    k = len(hist)
    return pd.DataFrame({"day_type": types[k:], "key": keys[k:]},
                        index=pd.to_datetime(fut))


def fy_quarter_bounds(ts):
    """(start, end) Timestamps of the Indian FY quarter containing ts."""
    ts = pd.Timestamp(ts)
    q_start_month = {4: 4, 5: 4, 6: 4, 7: 7, 8: 7, 9: 7,
                     10: 10, 11: 10, 12: 10, 1: 1, 2: 1, 3: 1}[ts.month]
    start = pd.Timestamp(ts.year, q_start_month, 1)
    end = start + pd.offsets.QuarterEnd(0)
    return start, end


def fy_quarter_label(ts):
    ts = pd.Timestamp(ts)
    fy = ts.year + 1 if ts.month >= 4 else ts.year
    q = {4: 1, 5: 1, 6: 1, 7: 2, 8: 2, 9: 2, 10: 3, 11: 3, 12: 3, 1: 4, 2: 4, 3: 4}[ts.month]
    return f"Q{q} FY{str(fy)[2:]}"
