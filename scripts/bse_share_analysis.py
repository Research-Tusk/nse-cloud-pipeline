"""
BSE Ltd Share Price Analysis
Fetches BSE.NS (BSE Ltd listed on NSE) daily closing prices via yfinance,
joins with BSE daily transaction revenue, computes 50-day MA, and runs
a linear regression to predict BSE Ltd's share price.

Output: dashboard/data/bse_share_analysis.json

Run: python scripts/bse_share_analysis.py
"""

import json
import warnings
import numpy as np
from datetime import datetime, timezone
from pathlib import Path

warnings.filterwarnings("ignore")

SCRIPT_DIR   = Path(__file__).parent
REPO_ROOT    = SCRIPT_DIR.parent
REVENUE_FILE = REPO_ROOT / "dashboard" / "data" / "bse_dashboard_data.json"
OUTPUT_FILE  = REPO_ROOT / "dashboard" / "data" / "bse_share_analysis.json"

MA_WINDOW = 50


def fetch_price_history(period="2y"):
    import yfinance as yf
    ticker = yf.Ticker("BSE.NS")
    hist = ticker.history(period=period)
    price_by_date = {
        str(d)[:10]: round(float(c), 2)
        for d, c in zip(hist.index, hist["Close"])
    }
    print(f"Fetched {len(price_by_date)} price records "
          f"({min(price_by_date)} → {max(price_by_date)})")
    return price_by_date


def load_revenue_data():
    data = json.loads(REVENUE_FILE.read_text())
    daily = sorted(data.get("daily", []), key=lambda r: r["date"])
    rev_by_date = {r["date"]: r["total_rev"] for r in daily if r.get("total_rev")}
    print(f"Revenue data: {len(rev_by_date)} days "
          f"({min(rev_by_date)} → {max(rev_by_date)})")
    return rev_by_date


def rolling_ma(ordered_pairs, window):
    """Compute rolling MA over (date, value) pairs. Returns {date: ma}."""
    result = {}
    for i, (d, v) in enumerate(ordered_pairs):
        if i >= window - 1:
            w = [ordered_pairs[j][1] for j in range(i - window + 1, i + 1)]
            result[d] = round(float(np.mean(w)), 4)
    return result


def run_ols(X, Y):
    """Returns slope, intercept, R², Pearson r."""
    slope, intercept = np.polyfit(X, Y, 1)
    pred = slope * X + intercept
    res  = Y - pred
    r2   = 1 - np.var(res) / np.var(Y)
    r    = np.corrcoef(X, Y)[0, 1]
    return slope, intercept, r2, r


def main():
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    print(f"[{now_utc}] BSE share analysis starting…")

    # ── Data ──
    try:
        price_by_date = fetch_price_history()
    except Exception as e:
        print(f"ERROR fetching prices: {e}")
        return

    rev_by_date = load_revenue_data()

    # ── 50-day MA of Revenue ──
    rev_dates  = sorted(rev_by_date)
    rev_tuples = [(d, rev_by_date[d]) for d in rev_dates]
    rev_ma50   = rolling_ma(rev_tuples, MA_WINDOW)

    # ── 50-day MA of Price ──
    price_dates  = sorted(price_by_date)
    price_tuples = [(d, price_by_date[d]) for d in price_dates]
    price_ma50   = rolling_ma(price_tuples, MA_WINDOW)

    # ── Build regression dataset ──
    rows = []
    for d in sorted(rev_ma50):
        price = price_by_date.get(d)
        if price:
            rows.append({
                "date":       d,
                "revenue_cr": rev_by_date[d],
                "rev_ma50":   rev_ma50[d],
                "price":      price,
                "price_ma50": price_ma50.get(d),
            })

    print(f"Regression dataset: {len(rows)} days "
          f"({rows[0]['date']} → {rows[-1]['date']})")

    if len(rows) < 10:
        print("ERROR: insufficient data for regression")
        return

    X = np.array([r["rev_ma50"] for r in rows])
    Y = np.array([r["price"]    for r in rows])

    slope, intercept, r2, pearson_r = run_ols(X, Y)
    print(f"\nRegression: Price = {slope:.2f} × Rev_MA50 + {intercept:.2f}")
    print(f"  R² = {r2:.3f}  |  Pearson r = {pearson_r:.3f}")

    # ── Annotate series with predictions ──
    series = []
    for r in rows:
        series.append({
            "date":       r["date"],
            "revenue_cr": r["revenue_cr"],
            "rev_ma50":   r["rev_ma50"],
            "price":      r["price"],
            "price_ma50": r["price_ma50"],
            "price_pred": round(slope * r["rev_ma50"] + intercept, 2),
        })

    latest = series[-1]
    error_pct = round(abs(latest["price_pred"] - latest["price"]) / latest["price"] * 100, 1)

    fit_label = "strong" if r2 > 0.7 else "moderate" if r2 > 0.4 else "weak"

    output = {
        "updated_at": now_utc,
        "ticker":     "BSE.NS",
        "ma_window":  MA_WINDOW,
        "n_days":     len(rows),
        "regression": {
            "slope":      round(slope,      4),
            "intercept":  round(intercept,  2),
            "r_squared":  round(r2,         4),
            "pearson_r":  round(pearson_r,  4),
            "equation":   f"Price = {slope:.2f} × Rev_MA50 + {intercept:.2f}",
            "fit":        fit_label,
        },
        "latest": {
            "date":         latest["date"],
            "revenue_cr":   latest["revenue_cr"],
            "rev_ma50":     latest["rev_ma50"],
            "price_actual": latest["price"],
            "price_pred":   latest["price_pred"],
            "price_ma50":   latest["price_ma50"],
            "error_pct":    error_pct,
        },
        "series": series,
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(output, indent=2))
    print(f"\nWrote {OUTPUT_FILE} ({OUTPUT_FILE.stat().st_size} bytes, {len(series)} rows)")
    print(f"Latest: {latest['date']}  actual ₹{latest['price']}  "
          f"pred ₹{latest['price_pred']}  error {error_pct}%")


if __name__ == "__main__":
    main()
