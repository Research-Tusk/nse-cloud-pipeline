"""
NSE Live Market Poller — GitHub Actions script
Fetches today's F&O + Cash turnover from NSE historical daily APIs,
computes exchange revenue, writes dashboard/data/nse_live.json,
and stores snapshots in Supabase nse_live_snapshots.

APIs used (same as nse_pipeline.py — proven to work):
  F&O:  /api/historicalOR/fo/tbg/daily?month=Apr&year=2026
  Cash: /api/historicalOR/cm/tbg/daily?month=Apr&year=26
  Status: /api/marketStatus

Run: python scripts/nse_live_poller.py
Env: SUPABASE_URL, SUPABASE_KEY  (optional — writes JSON regardless)
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
# Take rates  (one-side × 2 = round-trip)
# ---------------------------------------------------------------------------
TR_FUT  = 0.00173 / 100 * 2   # Futures  on INR turnover
TR_OPT  = 0.03503 / 100 * 2   # Options  on premium turnover
TR_CASH = 0.00297 / 100 * 2   # Cash     on traded value

# ---------------------------------------------------------------------------
# NSE endpoints
# ---------------------------------------------------------------------------
NSE_HOME   = "https://www.nseindia.com/"
STATUS_API = "https://www.nseindia.com/api/marketStatus"
FO_API     = "https://www.nseindia.com/api/historicalOR/fo/tbg/daily"
CM_API     = "https://www.nseindia.com/api/historicalOR/cm/tbg/daily"

HISTORY_LIMIT = 48   # 4 hrs at 5-min intervals


# ---------------------------------------------------------------------------
# Fetch helpers
# ---------------------------------------------------------------------------

def make_session():
    session = cffi_requests.Session()
    r = session.get(NSE_HOME, impersonate="chrome")
    print(f"Bootstrap: {r.status_code}")
    time.sleep(2)
    return session


def fetch_market_status(session):
    try:
        r = session.get(STATUS_API, impersonate="chrome", timeout=15)
        if r.status_code == 200 and r.text.strip():
            return r.json()
    except Exception as e:
        print(f"marketStatus error: {e}")
    return None


def fetch_fo_cm(session):
    """
    Fetch current month's F&O and Cash daily data.
    Falls back to previous month if current month has no data yet
    (first few days of month before the API populates).
    Returns (fo_records, cm_records) — lists of dicts, newest first.
    """
    now = datetime.now()
    month_abbr = now.strftime("%b")   # "Apr"
    year_full  = str(now.year)        # "2026"
    year_short = now.strftime("%y")   # "26"

    fo_url = f"{FO_API}?month={month_abbr}&year={year_full}"
    cm_url = f"{CM_API}?month={month_abbr}&year={year_short}"

    print(f"Fetching F&O:  {fo_url}")
    fo_r = session.get(fo_url, impersonate="chrome", timeout=15)
    print(f"Fetching Cash: {cm_url}")
    cm_r = session.get(cm_url, impersonate="chrome", timeout=15)

    fo_data = fo_r.json().get("data", []) if fo_r.status_code == 200 and fo_r.text.strip() else []
    cm_data = cm_r.json().get("data", []) if cm_r.status_code == 200 and cm_r.text.strip() else []

    # Fallback to previous month if empty
    if not fo_data:
        prev = (now.replace(day=1) - timedelta(days=1))
        pm   = prev.strftime("%b")
        py   = str(prev.year)
        pys  = prev.strftime("%y")
        print(f"No F&O data for {month_abbr} — falling back to {pm}")
        fo_url = f"{FO_API}?month={pm}&year={py}"
        cm_url = f"{CM_API}?month={pm}&year={pys}"
        fo_r = session.get(fo_url, impersonate="chrome", timeout=15)
        cm_r = session.get(cm_url, impersonate="chrome", timeout=15)
        fo_data = fo_r.json().get("data", []) if fo_r.status_code == 200 else []
        cm_data = cm_r.json().get("data", []) if cm_r.status_code == 200 else []

    print(f"F&O records: {len(fo_data)}, Cash records: {len(cm_data)}")
    return fo_data, cm_data


# ---------------------------------------------------------------------------
# Revenue computation — uses confirmed field names from nse_pipeline.py
# ---------------------------------------------------------------------------

def compute_revenue(fo_records, cm_records):
    """
    Take the most recent trading day from F&O and Cash records
    and compute exchange revenue.

    F&O records: list of dicts with keys like Index_Futures_VAL, etc.
    CM records:  list of dicts with key CDT_TRADES_VALUES and F_TIMESTAMP.

    NSE returns records newest-first (index 0 = today or latest trading day).
    """
    if not fo_records and not cm_records:
        return None, None

    # Each record is {"data": {...fields...}} — unwrap one level (same as nse_pipeline.py)
    def _unwrap(rec):
        return rec.get("data", rec) if isinstance(rec, dict) else {}

    # Latest F&O record
    fo = _unwrap(fo_records[0]) if fo_records else {}
    fo_date = fo.get("date", fo.get("F_TIMESTAMP", ""))

    if_val   = float(fo.get("Index_Futures_VAL",  0) or 0)
    sf_val   = float(fo.get("Stock_Futures_VAL",  0) or 0)
    io_prem  = float(fo.get("Index_Options_PREM_VAL", 0) or 0)
    so_prem  = float(fo.get("Stock_Options_PREM_VAL", 0) or 0)
    io_not   = float(fo.get("Index_Options_VAL",  0) or 0)
    so_not   = float(fo.get("Stock_Options_VAL",  0) or 0)
    total_contracts = int(fo.get("F&O_Total_QTY", 0) or 0)
    total_fo_val    = float(fo.get("F&O_Total_VAL", 0) or 0)

    # Latest Cash record — match same date as F&O if possible
    cash_val = 0.0
    cm_date  = ""
    if cm_records:
        # Try to find the same date as F&O (unwrap nested "data" key)
        cm_today = next(
            (_unwrap(r) for r in cm_records if _unwrap(r).get("F_TIMESTAMP", "") == fo_date),
            _unwrap(cm_records[0])
        )
        cash_val = float(cm_today.get("CDT_TRADES_VALUES", 0) or 0)
        cm_date  = cm_today.get("F_TIMESTAMP", "")

    fut_turnover = if_val + sf_val
    opt_premium  = io_prem + so_prem
    opt_notional = io_not  + so_not

    fut_rev   = fut_turnover * TR_FUT
    opt_rev   = opt_premium  * TR_OPT
    cash_rev  = cash_val     * TR_CASH
    total_rev = fut_rev + opt_rev + cash_rev

    trade_date = fo_date or cm_date

    revenue = {
        # Turnover inputs (₹ Cr)
        "trade_date":               trade_date,
        "index_futures_turnover":   round(if_val,  2),
        "stock_futures_turnover":   round(sf_val,  2),
        "futures_turnover":         round(fut_turnover, 2),
        "index_options_premium":    round(io_prem, 2),
        "stock_options_premium":    round(so_prem, 2),
        "options_premium":          round(opt_premium,  2),
        "options_notional":         round(opt_notional, 2),
        "cash_traded_value":        round(cash_val, 2),
        "fo_total_contracts":       total_contracts,
        "fo_total_val":             round(total_fo_val, 2),
        # Take rates
        "take_rate_futures":        TR_FUT,
        "take_rate_options":        TR_OPT,
        "take_rate_cash":           TR_CASH,
        # Revenue (₹ Cr)
        "futures_revenue":          round(fut_rev,  4),
        "options_revenue":          round(opt_rev,  4),
        "cash_revenue":             round(cash_rev, 4),
        "total_revenue":            round(total_rev, 4),
        "has_data":                 bool(fut_turnover or opt_premium or cash_val),
    }

    # Full month breakdown (for chart history)
    # Merge F&O + Cash by date for all available records this month
    fo_by_date = {_unwrap(r).get("date", _unwrap(r).get("F_TIMESTAMP", "")): _unwrap(r) for r in fo_records}
    cm_by_date = {_unwrap(r).get("F_TIMESTAMP", ""): _unwrap(r) for r in cm_records}
    all_dates  = sorted(set(fo_by_date) | set(cm_by_date))

    month_history = []
    for d in all_dates:
        fo_r  = fo_by_date.get(d, {})
        cm_r  = cm_by_date.get(d, {})
        ifv   = float(fo_r.get("Index_Futures_VAL", 0) or 0)
        sfv   = float(fo_r.get("Stock_Futures_VAL", 0) or 0)
        iop   = float(fo_r.get("Index_Options_PREM_VAL", 0) or 0)
        sop   = float(fo_r.get("Stock_Options_PREM_VAL", 0) or 0)
        cv    = float(cm_r.get("CDT_TRADES_VALUES", 0) or 0)
        ft    = ifv + sfv
        op    = iop + sop
        fr    = ft * TR_FUT
        orev  = op  * TR_OPT
        cr    = cv  * TR_CASH
        month_history.append({
            "timestamp":        d,
            "revenue": {
                "has_data":              bool(ft or op or cv),
                "futures_revenue":       round(fr,   4),
                "options_revenue":       round(orev, 4),
                "cash_revenue":          round(cr,   4),
                "total_revenue":         round(fr + orev + cr, 4),
                "futures_turnover":      round(ft,  2),
                "options_premium":       round(op,  2),
                "cash_traded_value":     round(cv,  2),
                "index_futures_turnover":round(ifv, 2),
                "stock_futures_turnover":round(sfv, 2),
                "index_options_premium": round(iop, 2),
                "stock_options_premium": round(sop, 2),
            },
        })

    return revenue, month_history


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


def supabase_upsert(sb, ts_iso, market_status, revenue):
    try:
        sb.table("nse_live_snapshots").insert({
            "captured_at":   ts_iso,
            "market_status": market_status,
            "raw_turnover":  None,
            "revenue":       revenue,
            "has_data":      bool(revenue and revenue.get("has_data")),
        }).execute()
        print("Supabase insert OK")
    except Exception as e:
        print(f"Supabase insert ERROR: {e}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    now_utc = datetime.now(timezone.utc)
    ts_iso  = now_utc.strftime("%Y-%m-%dT%H:%M:%S")
    print(f"[{ts_iso}] NSE live poller starting…")

    session = make_session()

    # ── 1. Market status (NIFTY, market cap, GIFT Nifty) ──
    market_status = fetch_market_status(session)
    if market_status:
        nifty = next((m for m in market_status.get("marketState", []) if m.get("market") == "Capital Market"), {})
        print(f"NIFTY 50: {nifty.get('last')}  ({nifty.get('percentChange')}%)  [{nifty.get('marketStatus')}]")

    # ── 2. F&O + Cash turnover (historical daily APIs) ──
    fo_records, cm_records = fetch_fo_cm(session)

    # ── 3. Revenue ──
    revenue, month_history = compute_revenue(fo_records, cm_records)

    if revenue and revenue["has_data"]:
        print(
            f"Revenue ({revenue['trade_date']}) — "
            f"Fut ₹{revenue['futures_revenue']} Cr | "
            f"Opt ₹{revenue['options_revenue']} Cr | "
            f"Cash ₹{revenue['cash_revenue']} Cr | "
            f"Total ₹{revenue['total_revenue']} Cr"
        )
    else:
        print("Revenue: no data (market not yet traded today or holiday)")

    # ── 4. Supabase ──
    sb = get_supabase()
    if sb:
        supabase_upsert(sb, ts_iso, market_status, revenue)

    # ── 5. Write nse_live.json ──
    # history = all trading days this month (for the chart)
    # Newest-last so the chart renders left-to-right in time order
    payload = {
        "updated_at":    ts_iso,
        "market_status": market_status,
        "revenue":       revenue,
        "history":       month_history or [],
    }
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(payload, indent=2, default=str))
    size = OUTPUT_FILE.stat().st_size
    hist_len = len(month_history) if month_history else 0
    print(f"Wrote {OUTPUT_FILE} ({size} bytes, {hist_len} history entries)")


if __name__ == "__main__":
    main()
