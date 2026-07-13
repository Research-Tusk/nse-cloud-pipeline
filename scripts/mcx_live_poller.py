"""
MCX Live Stock Price Poller — GitHub Actions script
Fetches MCX Ltd's own stock price (ticker MCX.NS) via yfinance fast_info —
an intraday quote (~15 min delayed, not tick-real-time), so the dashboard
shows something better than yesterday's fixed close.

Unlike the NSE/BSE live pollers, this does not compute live turnover/revenue
— MCX has no equivalent live turnover feed wired up. Just the stock price.

Run: python scripts/mcx_live_poller.py
"""

import json
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR  = Path(__file__).parent
REPO_ROOT   = SCRIPT_DIR.parent
OUTPUT_FILE = REPO_ROOT / "dashboard" / "data" / "mcx_live.json"


def fetch_stock_price(ticker="MCX.NS"):
    try:
        import yfinance as yf
        fi = yf.Ticker(ticker).fast_info
        last = fi.last_price
        prev_close = fi.previous_close
        if last is None:
            return None
        return {
            "last_price":     round(float(last), 2),
            "previous_close": round(float(prev_close), 2) if prev_close else None,
            "open":           round(float(fi.open), 2) if fi.open else None,
            "day_high":       round(float(fi.day_high), 2) if fi.day_high else None,
            "day_low":        round(float(fi.day_low), 2) if fi.day_low else None,
            "pct_change":     round((last - prev_close) / prev_close * 100, 2) if prev_close else None,
        }
    except Exception as e:
        print(f"  stock price fetch error: {e}")
        return None


def main():
    now_utc = datetime.now(timezone.utc)
    ts_iso  = now_utc.strftime("%Y-%m-%dT%H:%M:%S")
    print(f"[{ts_iso}] MCX live poller starting…")

    stock_price = fetch_stock_price("MCX.NS")
    if stock_price:
        print(f"  MCX.NS {stock_price['last_price']}  ({stock_price['pct_change']}%)")

    payload = {
        "updated_at":  ts_iso,
        "stock_price": stock_price,
    }
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(payload, indent=2, default=str))
    size = OUTPUT_FILE.stat().st_size
    print(f"Wrote {OUTPUT_FILE} ({size} bytes)")


if __name__ == "__main__":
    main()
