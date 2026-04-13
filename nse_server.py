"""
NSE Live Market Turnover Tracker — Flask backend
Polls NSE APIs every 60s, caches data in memory, writes to turnover_log.csv.
Run: python nse_server.py
"""

import csv
import json
import os
import threading
import time
from collections import deque
from datetime import datetime

from curl_cffi import requests as cffi_requests
from flask import Flask, jsonify, send_file
from flask_cors import CORS

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

NSE_HOME = "https://www.nseindia.com/"
TURNOVER_API = "https://www.nseindia.com/api/market-turnover"
STATUS_API = "https://www.nseindia.com/api/marketStatus"
POLL_INTERVAL = 60          # seconds
MAX_HISTORY = 240           # 4 hours at 1 snapshot/min
CSV_FILE = "turnover_log.csv"

HOME_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;"
        "q=0.9,image/avif,image/webp,*/*;q=0.8"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

API_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.nseindia.com/",
}

# ---------------------------------------------------------------------------
# Take rates  (one-side bps × 2 = round-trip)
#   Futures : 0.00173% × 2  per ₹ of futures INR turnover
#   Options : 0.03503% × 2  per ₹ of options PREMIUM turnover
#   Cash    : 0.00297% × 2  per ₹ of cash traded value
# ---------------------------------------------------------------------------

TR_FUT  = 0.00173 / 100 * 2   # 3.46e-5
TR_OPT  = 0.03503 / 100 * 2   # 7.006e-4
TR_CASH = 0.00297 / 100 * 2   # 5.94e-5

# ---------------------------------------------------------------------------
# Revenue computation
# ---------------------------------------------------------------------------

def _fval(d, *keys):
    """Return the first non-zero float found among keys in dict d (flat or nested)."""
    if not isinstance(d, dict):
        return 0.0
    for k in keys:
        v = d.get(k)
        if v is not None and v != "" and v != 0:
            try:
                return float(v)
            except (TypeError, ValueError):
                pass
    return 0.0


def _search_nested(d, *keys):
    """Try to find a key in a nested dict structure (1 level deep)."""
    if not isinstance(d, dict):
        return 0.0
    # flat lookup first
    val = _fval(d, *keys)
    if val:
        return val
    # try in nested dicts
    for v in d.values():
        if isinstance(v, dict):
            val = _fval(v, *keys)
            if val:
                return val
        elif isinstance(v, list):
            for item in v:
                if isinstance(item, dict):
                    val = _fval(item, *keys)
                    if val:
                        return val
    return 0.0


def compute_revenue(turnover_data):
    """
    Extract segment turnover figures from the raw API response and compute
    estimated exchange revenue using NSE take rates.

    Tries multiple field-name variants to handle both:
      - Historical API shape  (Index_Futures_VAL, Index_Options_PREM_VAL, CDT_TRADES_VALUES)
      - Live market-turnover API shape (unknown until market opens; keys logged on first hit)

    Returns a dict with per-segment figures and totals, all in ₹ Cr.
    Returns None if turnover_data is None.
    """
    if not turnover_data:
        return None

    # Log the top-level keys on first encounter so we can adapt field names
    top_keys = list(turnover_data.keys()) if isinstance(turnover_data, dict) else []

    # ---- Futures turnover (₹ Cr) ----
    if_val = _search_nested(
        turnover_data,
        "Index_Futures_VAL", "indexFuturesVAL", "indexFutures", "IF_VAL",
        "futuresIndexTurnover", "index_futures_val",
    )
    sf_val = _search_nested(
        turnover_data,
        "Stock_Futures_VAL", "stockFuturesVAL", "stockFutures", "SF_VAL",
        "futuresStockTurnover", "stock_futures_val",
    )
    fut_turnover = if_val + sf_val

    # ---- Options PREMIUM turnover (₹ Cr) — NOT notional ----
    io_prem = _search_nested(
        turnover_data,
        "Index_Options_PREM_VAL", "indexOptionsPremVAL", "indexOptionsPremium",
        "IO_PREM_VAL", "optionsIndexPremium", "index_options_prem_val",
    )
    so_prem = _search_nested(
        turnover_data,
        "Stock_Options_PREM_VAL", "stockOptionsPremVAL", "stockOptionsPremium",
        "SO_PREM_VAL", "optionsStockPremium", "stock_options_prem_val",
    )
    opt_premium = io_prem + so_prem

    # ---- Cash traded value (₹ Cr) ----
    cash_val = _search_nested(
        turnover_data,
        "CDT_TRADES_VALUES", "cashTradedValues", "cmTurnover", "CM_VAL",
        "cashMarketTurnover", "cdt_trades_values", "equityTurnover",
    )

    # ---- Revenue (₹ Cr) ----
    fut_rev  = fut_turnover  * TR_FUT
    opt_rev  = opt_premium   * TR_OPT
    cash_rev = cash_val      * TR_CASH
    total_rev = fut_rev + opt_rev + cash_rev

    return {
        # Inputs
        "index_futures_turnover": round(if_val, 2),
        "stock_futures_turnover": round(sf_val, 2),
        "futures_turnover":       round(fut_turnover, 2),
        "index_options_premium":  round(io_prem, 2),
        "stock_options_premium":  round(so_prem, 2),
        "options_premium":        round(opt_premium, 2),
        "cash_traded_value":      round(cash_val, 2),
        # Take rates used
        "take_rate_futures":  TR_FUT,
        "take_rate_options":  TR_OPT,
        "take_rate_cash":     TR_CASH,
        # Revenue outputs (₹ Cr)
        "futures_revenue":    round(fut_rev, 4),
        "options_revenue":    round(opt_rev, 4),
        "cash_revenue":       round(cash_rev, 4),
        "total_revenue":      round(total_rev, 4),
        # Meta
        "has_data": bool(fut_turnover or opt_premium or cash_val),
        "api_top_keys": top_keys,
    }


# ---------------------------------------------------------------------------
# Shared state (protected by lock)
# ---------------------------------------------------------------------------

_lock = threading.Lock()
_latest_turnover = None     # raw JSON dict or None (market closed)
_latest_revenue  = None     # computed revenue dict or None
_latest_status = None       # raw JSON dict
_history = deque(maxlen=MAX_HISTORY)  # {timestamp, turnover, revenue}

# ---------------------------------------------------------------------------
# NSE session
# ---------------------------------------------------------------------------

_session = cffi_requests.Session(impersonate="chrome110")


def bootstrap_cookies():
    """Hit the NSE homepage to seed session cookies."""
    try:
        r = _session.get(NSE_HOME, headers=HOME_HEADERS, timeout=15)
        print(f"[{_ts()}] Bootstrap OK — status {r.status_code}")
    except Exception as exc:
        print(f"[{_ts()}] Bootstrap ERROR: {exc}")


# ---------------------------------------------------------------------------
# CSV logging
# ---------------------------------------------------------------------------

def _init_csv():
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                "timestamp",
                "futures_turnover_cr", "options_premium_cr", "cash_value_cr",
                "futures_revenue_cr", "options_revenue_cr", "cash_revenue_cr",
                "total_revenue_cr",
                "raw_json",
            ])


def _append_csv(timestamp: str, data, revenue):
    with open(CSV_FILE, "a", newline="") as f:
        writer = csv.writer(f)
        rev = revenue or {}
        writer.writerow([
            timestamp,
            rev.get("futures_turnover", ""),
            rev.get("options_premium", ""),
            rev.get("cash_traded_value", ""),
            rev.get("futures_revenue", ""),
            rev.get("options_revenue", ""),
            rev.get("cash_revenue", ""),
            rev.get("total_revenue", ""),
            json.dumps(data),
        ])


# ---------------------------------------------------------------------------
# Polling thread
# ---------------------------------------------------------------------------

def _ts() -> str:
    return datetime.now().strftime("%Y-%m-%dT%H:%M:%S")


def _poll_once():
    global _latest_turnover, _latest_revenue, _latest_status

    # --- market-turnover ---
    try:
        r = _session.get(TURNOVER_API, headers=API_HEADERS, timeout=15)
        if r.status_code in (401, 403):
            print(f"[{_ts()}] Turnover {r.status_code} — re-bootstrapping")
            bootstrap_cookies()
            r = _session.get(TURNOVER_API, headers=API_HEADERS, timeout=15)

        ts = _ts()
        if r.text and r.text.strip():
            data = r.json()
            revenue = compute_revenue(data)
            if revenue and revenue["has_data"]:
                print(
                    f"[{_ts()}] Turnover OK — "
                    f"Fut ₹{revenue['futures_turnover']} Cr | "
                    f"Opt prem ₹{revenue['options_premium']} Cr | "
                    f"Cash ₹{revenue['cash_traded_value']} Cr | "
                    f"→ Revenue ₹{revenue['total_revenue']} Cr"
                )
            else:
                print(f"[{_ts()}] Turnover OK — data received, fields not yet mapped "
                      f"(keys: {list(data.keys()) if isinstance(data, dict) else type(data).__name__})")
        else:
            data = None
            revenue = None
            print(f"[{_ts()}] Turnover poll OK — empty (market closed?)")

        with _lock:
            _latest_turnover = data
            _latest_revenue  = revenue
            _history.append({"timestamp": ts, "turnover": data, "revenue": revenue})

        _append_csv(ts, data, revenue)

    except Exception as exc:
        print(f"[{_ts()}] Turnover poll ERROR: {exc}")

    # --- marketStatus ---
    try:
        r2 = _session.get(STATUS_API, headers=API_HEADERS, timeout=15)
        if r2.status_code in (401, 403):
            print(f"[{_ts()}] Status {r2.status_code} — re-bootstrapping")
            bootstrap_cookies()
            r2 = _session.get(STATUS_API, headers=API_HEADERS, timeout=15)

        if r2.text and r2.text.strip():
            with _lock:
                _latest_status = r2.json()
            print(f"[{_ts()}] Status poll OK")
        else:
            print(f"[{_ts()}] Status poll — empty response")

    except Exception as exc:
        print(f"[{_ts()}] Status poll ERROR: {exc}")


def _poll_loop():
    while True:
        _poll_once()
        time.sleep(POLL_INTERVAL)


# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------

app = Flask(__name__, static_folder=None)
CORS(app)


@app.route("/api/turnover")
def api_turnover():
    with _lock:
        return jsonify({
            "latest":  _latest_turnover,
            "revenue": _latest_revenue,
            "history": list(_history),
        })


@app.route("/api/status")
def api_status():
    with _lock:
        return jsonify(_latest_status)


@app.route("/")
def index():
    return send_file("dashboard.html")


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    _init_csv()
    print(f"[{_ts()}] Bootstrapping NSE cookies…")
    bootstrap_cookies()

    t = threading.Thread(target=_poll_loop, daemon=True)
    t.start()
    print(f"[{_ts()}] Poller started — first data in ~5s (initial poll running)")

    # Run one poll immediately so dashboard isn't empty on first load
    threading.Thread(target=_poll_once, daemon=True).start()

    app.run(host="0.0.0.0", port=5001, debug=False)
