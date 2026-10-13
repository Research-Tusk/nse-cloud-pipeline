"""
Forecast layer entry point — writes dashboard/data/{ex}_forecast.json.

Run:  python scripts/forecast/run.py --ex nse,bse,mcx
      (daily in .github/workflows/exchange-update.yml after the share analyses)
"""

import argparse
import json
import math
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from forecast import adr_forecast as af  # noqa: E402
from forecast import common, target_price, vix_activity  # noqa: E402

EVAL_START = {"nse": "2024-01-01", "bse": "2024-01-01", "mcx": "2023-01-01"}
TUNE_END = "2025-06-01"


def _clean(o):
    """Make JSON-safe: NaN/inf → None, numpy scalars → python."""
    if isinstance(o, dict):
        return {str(k): _clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [_clean(v) for v in o]
    if hasattr(o, "item"):
        o = o.item()
    if isinstance(o, float) and (math.isnan(o) or math.isinf(o)):
        return None
    if isinstance(o, float):
        return round(o, 6)
    return o


def data_notes(ex, df, pm):
    notes = []
    if ex == "mcx":
        notes.append("MCX revenue is read pre-computed from a separate Supabase table; "
                     "no volumes or VIX link, so the VIX panel and M4 are not used.")
        notes.append("The MCX price regression averages revenue only over days with a "
                     "Yahoo price, so its Rev_MA45 can differ from the trading-day 45-DMA "
                     "(mean +0.9 %, up to 9.5 % over the last 300 days).")
    if ex == "nse" and pm and pm.get("status") != "ok":
        notes.append("NSE listed 2026-09-24; price regression unavailable until enough "
                     "trading days accumulate; until then the scenario manager shows the PE method only.")
    if ex == "bse":
        notes.append("BSE revenue grew several-fold since 2023; VIX effects come from a regression "
                     "with a piecewise trend, so growth is not mistaken for a VIX effect.")
    return notes


def run(ex):
    t0 = time.time()
    df = common.load_daily(ex)
    print(f"[{ex}] {len(df)} days {df.index.min().date()} → {df.index.max().date()}")

    errs = af.backtest(ex, df, EVAL_START[ex], TUNE_END)
    bt = af.summarise_backtest(errs, ex)
    selected = bt["promotion"]["selected"]
    print(f"[{ex}] backtest {len(errs)} errors, selected {selected} "
          f"({time.time() - t0:.0f}s)")

    live = af.live_forecast(ex, df, selected, errs)
    # also expose the best calendar model's path for comparison when baseline is kept
    alt = None
    cal_models = [m for m in bt["by_model"] if m not in ("M0", "M1")]
    best_cal = min(cal_models, key=lambda m: bt["by_model"][m]["mape_h10"] + bt["by_model"][m]["mape_h20"],
                   default=None)
    bt["best_calendar_model"] = best_cal
    if best_cal and best_cal != selected:
        alt_live = af.live_forecast(ex, df, best_cal, errs)
        alt = {"model": best_cal, "path": alt_live["path"], "quarter_end": alt_live["quarter_end"]}

    pm = target_price.price_model(ex)
    out = {
        "exchange": ex,
        "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "as_of": str(df.index[-1].date()),
        "model_selected": selected,
        "dma": af.dma_snapshot(df),
        "forecast": live,
        "alt_forecast": alt,
        "backtest": bt,
        "price_model": pm,
        "vix": vix_activity.vix_summary(ex, df) if ex in ("nse", "bse") else None,
        "notes": data_notes(ex, df, pm),
    }
    path = common.DATA_DIR / f"{ex}_forecast.json"
    with open(path, "w") as f:
        json.dump(_clean(out), f, separators=(",", ":"), allow_nan=False)
    print(f"[{ex}] wrote {path.relative_to(common.PROJECT_ROOT)} ({time.time() - t0:.0f}s)")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ex", default="nse,bse,mcx")
    args = ap.parse_args()
    for ex in args.ex.split(","):
        run(ex.strip())


if __name__ == "__main__":
    main()
