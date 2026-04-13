"""
NSE Live Market Poller — GitHub Actions script
Fetches NSE market-turnover + marketStatus, computes revenue,
writes dashboard/data/nse_live.json, and stores snapshots in Supabase.

Run: python scripts/nse_live_poller.py
Env: SUPABASE_URL, SUPABASE_KEY
"""

import json
import os
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

from curl_cffi import requests as cffi_requests

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR  = Path(__file__).parent
REPO_ROOT   = SCRIPT_DIR.parent
OUTPUT_FILE = REPO_ROOT / "dashboard" / "data" / "nse_live.json"

# ---------------------------------------------------------------------------
# Take rates  (one-side bps × 2 = round-trip)
# ---------------------------------------------------------------------------
TR_FUT  = 0.00173 / 100 * 2   # Futures  on INR turnover
TR_OPT  = 0.03503 / 100 * 2   # Options  on premium turnover
TR_CASH = 0.00297 / 100 * 2   # Cash     on traded value

# ---------------------------------------------------------------------------
# NSE endpoints
# ---------------------------------------------------------------------------
NSE_HOME      = "https://www.nseindia.com/"
TURNOVER_API  = "https://www.nseindia.com/api/market-turnover"
STATUS_API    = "https://www.nseindia.com/api/marketStatus"
HISTORY_LIMIT = 48   # 4 hrs at 5-min intervals stored in JSON

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
    **HOME_HEADERS,
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://www.nseindia.com/",
}

# ---------------------------------------------------------------------------
# Revenue computation  (mirrors nse_server.py)
# ---------------------------------------------------------------------------

def _fval(d, *keys):
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


def _search(d, *keys):
    val = _fval(d, *keys)
    if val:
        return val
    if isinstance(d, dict):
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
    if not turnover_data:
        return None

    if_val = _search(turnover_data,
        "Index_Futures_VAL", "indexFuturesVAL", "indexFutures")
    sf_val = _search(turnover_data,
        "Stock_Futures_VAL", "stockFuturesVAL", "stockFutures")
    fut_turnover = if_val + sf_val

    io_prem = _search(turnover_data,
        "Index_Options_PREM_VAL", "indexOptionsPremVAL", "indexOptionsPremium")
    so_prem = _search(turnover_data,
        "Stock_Options_PREM_VAL", "stockOptionsPremVAL", "stockOptionsPremium")
    opt_premium = io_prem + so_prem

    cash_val = _search(turnover_data,
        "CDT_TRADES_VALUES", "cashTradedValues", "cmTurnover", "equityTurnover")

    fut_rev   = fut_turnover * TR_FUT
    opt_rev   = opt_premium  * TR_OPT
    cash_rev  = cash_val     * TR_CASH
    total_rev = fut_rev + opt_rev + cash_rev

    return {
        "index_futures_turnover": round(if_val, 2),
        "stock_futures_turnover": round(sf_val, 2),
        "futures_turnover":       round(fut_turnover, 2),
        "index_options_premium":  round(io_prem, 2),
        "stock_options_premium":  round(so_prem, 2),
        "options_premium":        round(opt_premium, 2),
        "cash_traded_value":      round(cash_val, 2),
        "take_rate_futures":      TR_FUT,
        "take_rate_options":      TR_OPT,
        "take_rate_cash":         TR_CASH,
        "futures_revenue":        round(fut_rev, 4),
        "options_revenue":        round(opt_rev, 4),
        "cash_revenue":           round(cash_rev, 4),
        "total_revenue":          round(total_rev, 4),
        "has_data":               bool(fut_turnover or opt_premium or cash_val),
        "api_top_keys":           list(turnover_data.keys()) if isinstance(turnover_data, dict) else [],
    }


# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------

def get_supabase():
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY", "")
    if not url or not key:
        print("WARNING: SUPABASE_URL / SUPABASE_KEY not set — skipping Supabase writes")
        return None
    from supabase import create_client
    return create_client(url, key)


def supabase_upsert(sb, ts_iso, market_status, raw_turnover, revenue):
    try:
        sb.table("nse_live_snapshots").insert({
            "captured_at":   ts_iso,
            "market_status": market_status,
            "raw_turnover":  raw_turnover,
            "revenue":       revenue,
            "has_data":      bool(revenue and revenue.get("has_data")),
        }).execute()
        print("Supabase insert OK")
    except Exception as e:
        print(f"Supabase insert ERROR: {e}")


def supabase_get_history(sb):
    """Return last HISTORY_LIMIT snapshots for embedding in nse_live.json."""
    try:
        res = (
            sb.table("nse_live_snapshots")
            .select("captured_at, revenue, has_data")
            .order("captured_at", desc=True)
            .limit(HISTORY_LIMIT)
            .execute()
        )
        rows = res.data or []
        # Return oldest-first for charting
        return [
            {"timestamp": r["captured_at"], "revenue": r["revenue"]}
            for r in reversed(rows)
        ]
    except Exception as e:
        print(f"Supabase history fetch ERROR: {e}")
        return []


def supabase_cleanup(sb):
    """Delete snapshots older than 7 days to keep table lean."""
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        sb.table("nse_live_snapshots").delete().lt("captured_at", cutoff).execute()
    except Exception as e:
        print(f"Supabase cleanup ERROR: {e}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    now_utc = datetime.now(timezone.utc)
    ts_iso  = now_utc.strftime("%Y-%m-%dT%H:%M:%S")
    print(f"[{ts_iso}] NSE live poller starting…")

    # ── 1. Bootstrap NSE cookies ──
    session = cffi_requests.Session(impersonate="chrome110")
    try:
        r0 = session.get(NSE_HOME, headers=HOME_HEADERS, timeout=15)
        print(f"Bootstrap status: {r0.status_code}")
    except Exception as e:
        print(f"Bootstrap ERROR: {e}")
        sys.exit(1)
    time.sleep(2)

    # ── 2. Fetch marketStatus ──
    market_status = None
    try:
        r = session.get(STATUS_API, headers=API_HEADERS, timeout=15)
        if r.text and r.text.strip():
            market_status = r.json()
            nifty = next(
                (m for m in market_status.get("marketState", []) if m.get("market") == "Capital Market"),
                {}
            )
            print(f"NIFTY 50: {nifty.get('last')} ({nifty.get('percentChange')}%)")
        else:
            print("marketStatus: empty response")
    except Exception as e:
        print(f"marketStatus ERROR: {e}")

    # ── 3. Fetch market-turnover ──
    raw_turnover = None
    try:
        r2 = session.get(TURNOVER_API, headers=API_HEADERS, timeout=15)
        if r2.text and r2.text.strip():
            raw_turnover = r2.json()
            print(f"Turnover API keys: {list(raw_turnover.keys()) if isinstance(raw_turnover, dict) else type(raw_turnover).__name__}")
        else:
            print("market-turnover: empty (market closed?)")
    except Exception as e:
        print(f"market-turnover ERROR: {e}")

    # ── 4. Compute revenue ──
    revenue = compute_revenue(raw_turnover)
    if revenue and revenue["has_data"]:
        print(
            f"Revenue — Fut: ₹{revenue['futures_revenue']} Cr | "
            f"Opt: ₹{revenue['options_revenue']} Cr | "
            f"Cash: ₹{revenue['cash_revenue']} Cr | "
            f"Total: ₹{revenue['total_revenue']} Cr"
        )
    else:
        print("Revenue: no turnover data (market closed or fields not yet mapped)")

    # ── 5. Supabase ──
    sb = get_supabase()
    history = []
    if sb:
        supabase_upsert(sb, ts_iso, market_status, raw_turnover, revenue)
        history = supabase_get_history(sb)
        supabase_cleanup(sb)
    else:
        # Fallback: read existing nse_live.json history if Supabase unavailable
        if OUTPUT_FILE.exists():
            try:
                old = json.loads(OUTPUT_FILE.read_text())
                history = old.get("history", [])[-HISTORY_LIMIT:]
                # Append current snapshot
                history.append({"timestamp": ts_iso, "revenue": revenue})
                history = history[-HISTORY_LIMIT:]
            except Exception:
                pass

    # ── 6. Write nse_live.json ──
    payload = {
        "updated_at":     ts_iso,
        "market_status":  market_status,
        "revenue":        revenue,
        "history":        history,
    }
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(payload, indent=2, default=str))
    print(f"Wrote {OUTPUT_FILE} ({OUTPUT_FILE.stat().st_size} bytes, {len(history)} history entries)")


if __name__ == "__main__":
    main()
