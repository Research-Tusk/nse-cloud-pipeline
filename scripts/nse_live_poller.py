"""
NSE Live Market Poller — GitHub Actions script
Fetches live turnover from NSE's homepage Next.js API (getMarketTurnoverSummary),
computes exchange revenue, writes dashboard/data/nse_live.json,
and stores snapshots in Supabase nse_live_snapshots.

Primary API (same source as NSE website live widget):
  /api/NextApi/apiClient?functionName=getMarketTurnoverSummary
  → returns today's live figures (values in ₹, not ₹ Cr)

Fallback (for history / when primary is empty):
  /api/historicalOR/fo/tbg/daily?month=Apr&year=2026
  /api/historicalOR/cm/tbg/daily?month=Apr&year=26

Run: python scripts/nse_live_poller.py
Env: SUPABASE_URL, SUPABASE_KEY  (optional — writes JSON regardless)
"""

import json
import os
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

from curl_cffi import requests as cffi_requests

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR  = Path(__file__).parent
REPO_ROOT   = SCRIPT_DIR.parent
OUTPUT_FILE   = REPO_ROOT / "dashboard" / "data" / "nse_live.json"
HOURLY_FILE   = REPO_ROOT / "dashboard" / "data" / "nse_live_hourly.json"

# ---------------------------------------------------------------------------
# IST timezone
# ---------------------------------------------------------------------------
IST = timezone(timedelta(hours=5, minutes=30))

# Market session constants
MARKET_OPEN_MIN  = 9 * 60 + 15   # 9:15 AM IST in minutes since midnight
MARKET_TOTAL_MIN = 375            # 9:15 AM → 3:30 PM = 375 min

# Snapshot hours (IST): on-the-hour marks from 10–15, plus 15:30 close
SNAPSHOT_LABELS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "15:30"]

# ---------------------------------------------------------------------------
# Take rates  (one-side × 2 = round-trip)
# ---------------------------------------------------------------------------
TR_FUT  = 0.00173 / 100 * 2   # Futures  on INR turnover
TR_OPT  = 0.03503 / 100 * 2   # Options  on premium turnover
TR_CASH = 0.00297 / 100 * 2   # Cash     on traded value

# ---------------------------------------------------------------------------
# NSE endpoints
# ---------------------------------------------------------------------------
NSE_HOME       = "https://www.nseindia.com/"
STATUS_API     = "https://www.nseindia.com/api/marketStatus"
LIVE_TURNOVER  = "https://www.nseindia.com/api/NextApi/apiClient?functionName=getMarketTurnoverSummary"
FO_API         = "https://www.nseindia.com/api/historicalOR/fo/tbg/daily"
CM_API         = "https://www.nseindia.com/api/historicalOR/cm/tbg/daily"


# ---------------------------------------------------------------------------
# Session
# ---------------------------------------------------------------------------

def make_session():
    session = cffi_requests.Session()
    r = session.get(NSE_HOME, impersonate="chrome")
    print(f"Bootstrap: {r.status_code}")
    time.sleep(2)
    return session


# ---------------------------------------------------------------------------
# Market status
# ---------------------------------------------------------------------------

def fetch_market_status(session):
    try:
        r = session.get(STATUS_API, impersonate="chrome", timeout=15)
        if r.status_code == 200 and r.text.strip():
            return r.json()
    except Exception as e:
        print(f"marketStatus error: {e}")
    return None


# ---------------------------------------------------------------------------
# Live turnover summary — PRIMARY source (same as NSE homepage widget)
# Values are in ₹ (rupees). Divide by 1e7 to get ₹ Cr.
# ---------------------------------------------------------------------------

def fetch_live_turnover(session):
    """
    Returns parsed revenue dict from getMarketTurnoverSummary, or None.

    Response structure:
      data.equityDerivatives[] — segment FO instruments:
        "Index Futures"  → value          = IF turnover (₹)
        "Stock Futures"  → value          = SF turnover (₹)
        "Index Options"  → premiumTurnover = IO premium (₹)
        "Stock Options"  → premiumTurnover = SO premium (₹)
      data.equities[]    — segment CM instruments:
        "Equity"         → value          = cash traded (₹)
    """
    try:
        r = session.get(LIVE_TURNOVER, impersonate="chrome", timeout=15)
        print(f"Live turnover API: {r.status_code}, {len(r.text)} bytes")
        if r.status_code != 200 or not r.text.strip():
            return None
        raw = r.json().get("data", {})
    except Exception as e:
        print(f"Live turnover error: {e}")
        return None

    def _find(arr, instrument):
        return next((x for x in arr if x.get("instrument") == instrument), {})

    def _cr(v):
        """Convert rupees → crores (divide by 1e7)."""
        return round(float(v or 0) / 1e7, 2)

    eq_deriv = raw.get("equityDerivatives", [])
    equities = raw.get("equities", [])

    if_row = _find(eq_deriv, "Index Futures")
    sf_row = _find(eq_deriv, "Stock Futures")
    io_row = _find(eq_deriv, "Index Options")
    so_row = _find(eq_deriv, "Stock Options")
    cm_row = _find(equities,  "Equity")

    if_val  = _cr(if_row.get("value", 0))
    sf_val  = _cr(sf_row.get("value", 0))
    io_prem = _cr(io_row.get("premiumTurnover", 0))
    so_prem = _cr(so_row.get("premiumTurnover", 0))
    cash_val= _cr(cm_row.get("value", 0))

    fut_turnover = if_val + sf_val
    opt_premium  = io_prem + so_prem

    fut_rev   = fut_turnover * TR_FUT
    opt_rev   = opt_premium  * TR_OPT
    cash_rev  = cash_val     * TR_CASH
    total_rev = fut_rev + opt_rev + cash_rev

    # Use the most recent mktTimeStamp as the trade date
    ts = (if_row.get("mktTimeStamp") or cm_row.get("mktTimeStamp") or "")
    trade_date = ts[:10] if ts else raw.get("asOnDate", "")

    has_data = bool(fut_turnover or opt_premium or cash_val)
    if has_data:
        print(
            f"Live ({trade_date}) — "
            f"IF ₹{if_val} Cr  SF ₹{sf_val} Cr  "
            f"IO prem ₹{io_prem} Cr  SO prem ₹{so_prem} Cr  "
            f"Cash ₹{cash_val} Cr"
        )
        print(
            f"  Revenue → Fut ₹{round(fut_rev,4)} Cr | "
            f"Opt ₹{round(opt_rev,4)} Cr | "
            f"Cash ₹{round(cash_rev,4)} Cr | "
            f"Total ₹{round(total_rev,4)} Cr"
        )
    else:
        print("Live turnover: no data in response")

    return {
        "trade_date":               trade_date,
        "index_futures_turnover":   if_val,
        "stock_futures_turnover":   sf_val,
        "futures_turnover":         round(fut_turnover, 2),
        "index_options_premium":    io_prem,
        "stock_options_premium":    so_prem,
        "options_premium":          round(opt_premium, 2),
        "cash_traded_value":        cash_val,
        "take_rate_futures":        TR_FUT,
        "take_rate_options":        TR_OPT,
        "take_rate_cash":           TR_CASH,
        "futures_revenue":          round(fut_rev,   4),
        "options_revenue":          round(opt_rev,   4),
        "cash_revenue":             round(cash_rev,  4),
        "total_revenue":            round(total_rev, 4),
        "has_data":                 has_data,
        "source":                   "live",
    }


# ---------------------------------------------------------------------------
# Historical month data — for the chart (all trading days this month)
# ---------------------------------------------------------------------------

def fetch_historical_month(session):
    """Returns list of {timestamp, revenue} dicts for current month, oldest-first."""
    now = datetime.now()
    month_abbr = now.strftime("%b")
    year_full  = str(now.year)
    year_short = now.strftime("%y")

    fo_url = f"{FO_API}?month={month_abbr}&year={year_full}"
    cm_url = f"{CM_API}?month={month_abbr}&year={year_short}"
    print(f"History F&O:  {fo_url}")
    fo_r = session.get(fo_url, impersonate="chrome", timeout=15)
    cm_r = session.get(cm_url, impersonate="chrome", timeout=15)

    fo_raw = fo_r.json().get("data", []) if fo_r.status_code == 200 and fo_r.text.strip() else []
    cm_raw = cm_r.json().get("data", []) if cm_r.status_code == 200 and cm_r.text.strip() else []

    if not fo_raw:
        prev = now.replace(day=1) - timedelta(days=1)
        pm, py, pys = prev.strftime("%b"), str(prev.year), prev.strftime("%y")
        print(f"No historical F&O for {month_abbr} — falling back to {pm}")
        fo_r = session.get(f"{FO_API}?month={pm}&year={py}", impersonate="chrome", timeout=15)
        cm_r = session.get(f"{CM_API}?month={pm}&year={pys}", impersonate="chrome", timeout=15)
        fo_raw = fo_r.json().get("data", []) if fo_r.status_code == 200 else []
        cm_raw = cm_r.json().get("data", []) if cm_r.status_code == 200 else []

    print(f"Historical records: {len(fo_raw)} F&O, {len(cm_raw)} cash")

    def _u(rec):
        return rec.get("data", rec) if isinstance(rec, dict) else {}

    fo_by_date = {_u(r).get("date", _u(r).get("F_TIMESTAMP", "")): _u(r) for r in fo_raw}
    cm_by_date = {_u(r).get("F_TIMESTAMP", ""): _u(r) for r in cm_raw}
    all_dates  = sorted(set(fo_by_date) | set(cm_by_date))

    history = []
    for d in all_dates:
        fo = fo_by_date.get(d, {})
        cm = cm_by_date.get(d, {})
        ifv  = float(fo.get("Index_Futures_VAL",      0) or 0)
        sfv  = float(fo.get("Stock_Futures_VAL",      0) or 0)
        iop  = float(fo.get("Index_Options_PREM_VAL", 0) or 0)
        sop  = float(fo.get("Stock_Options_PREM_VAL", 0) or 0)
        cv   = float(cm.get("CDT_TRADES_VALUES",      0) or 0)
        ft   = ifv + sfv
        op   = iop + sop
        fr   = ft  * TR_FUT
        orev = op  * TR_OPT
        cr   = cv  * TR_CASH
        history.append({
            "timestamp": d,
            "revenue": {
                "has_data":               bool(ft or op or cv),
                "trade_date":             d,
                "futures_turnover":       round(ft,   2),
                "options_premium":        round(op,   2),
                "cash_traded_value":      round(cv,   2),
                "index_futures_turnover": round(ifv,  2),
                "stock_futures_turnover": round(sfv,  2),
                "index_options_premium":  round(iop,  2),
                "stock_options_premium":  round(sop,  2),
                "futures_revenue":        round(fr,   4),
                "options_revenue":        round(orev, 4),
                "cash_revenue":           round(cr,   4),
                "total_revenue":          round(fr + orev + cr, 4),
                "source":                 "historical",
            },
        })
    return history


# ---------------------------------------------------------------------------
# Supabase
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
# Hourly revenue snapshots (10:00–15:30 IST)
# ---------------------------------------------------------------------------

def _hourly_label(now_ist):
    """Return snapshot label if this run falls in an hourly capture window, else None."""
    h, m = now_ist.hour, now_ist.minute
    # 15:30 close window: 15:28–15:35
    if h == 15 and 28 <= m <= 35:
        return "15:30"
    # On-the-hour marks 10–15: first 5-minute window
    if h in (10, 11, 12, 13, 14, 15) and m < 5:
        return f"{h:02d}:00"
    return None


def _elapsed_for_label(label):
    """Minutes elapsed since market open (9:15 AM) for a given label like '13:00'."""
    h, m = map(int, label.split(":"))
    return h * 60 + m - MARKET_OPEN_MIN


def _predict_eod(revenue, label):
    """Simple linear projection: revenue_so_far × (375 / elapsed_minutes)."""
    if not revenue or not revenue.get("has_data"):
        return None
    total   = float(revenue.get("total_revenue") or 0)
    elapsed = _elapsed_for_label(label)
    if elapsed <= 0:
        return None
    return round(total * MARKET_TOTAL_MIN / elapsed, 2)


def save_hourly_snapshot(revenue, now_ist):
    """Append or update today's hourly snapshot file."""
    label = _hourly_label(now_ist)
    if label is None:
        return  # not a snapshot window

    today_str = now_ist.strftime("%Y-%m-%d")

    # Load existing file
    existing = {}
    if HOURLY_FILE.exists():
        try:
            existing = json.loads(HOURLY_FILE.read_text())
        except Exception:
            existing = {}

    # Reset on new day
    if existing.get("date") != today_str:
        existing = {"date": today_str, "snapshots": []}

    # Skip if label already recorded (idempotent)
    snaps = existing.get("snapshots", [])
    if any(s["hour_label"] == label for s in snaps):
        print(f"Hourly snapshot {label} already recorded — skipping")
        return

    elapsed = _elapsed_for_label(label)
    pred    = _predict_eod(revenue, label)

    snap = {
        "hour_label":       label,
        "captured_ist":     now_ist.strftime("%Y-%m-%dT%H:%M:%S"),
        "elapsed_minutes":  elapsed,
        "total_revenue":    round(float(revenue.get("total_revenue") or 0), 2) if revenue else None,
        "futures_revenue":  round(float(revenue.get("futures_revenue") or 0), 2) if revenue else None,
        "options_revenue":  round(float(revenue.get("options_revenue") or 0), 2) if revenue else None,
        "cash_revenue":     round(float(revenue.get("cash_revenue") or 0), 2) if revenue else None,
        "has_data":         bool(revenue and revenue.get("has_data")),
        "predicted_eod":    pred,
    }
    snaps.append(snap)
    snaps.sort(key=lambda x: x["hour_label"])
    existing["snapshots"] = snaps

    HOURLY_FILE.parent.mkdir(parents=True, exist_ok=True)
    HOURLY_FILE.write_text(json.dumps(existing, indent=2))
    print(f"Hourly snapshot {label} saved — revenue ₹{snap['total_revenue']} Cr, predicted EOD ₹{pred} Cr")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    now_utc = datetime.now(timezone.utc)
    ts_iso  = now_utc.strftime("%Y-%m-%dT%H:%M:%S")
    print(f"[{ts_iso}] NSE live poller starting…")

    session = make_session()

    # ── 1. Market status ──
    market_status = fetch_market_status(session)
    if market_status:
        nifty = next(
            (m for m in market_status.get("marketState", []) if m.get("market") == "Capital Market"), {}
        )
        print(f"NIFTY 50: {nifty.get('last')}  ({nifty.get('percentChange')}%)  [{nifty.get('marketStatus')}]")

    # ── 2. Live turnover (primary — same source as NSE homepage) ──
    revenue = fetch_live_turnover(session)

    # ── 3. Monthly history (for chart) ──
    month_history = fetch_historical_month(session)

    # ── 4. If today's live data came back, replace/append today's entry in history ──
    if revenue and revenue["has_data"]:
        today_str = revenue["trade_date"]
        # Remove any existing entry for today from history (will be replaced by live)
        month_history = [h for h in month_history if h["timestamp"] != today_str]
        month_history.append({
            "timestamp": today_str,
            "revenue":   {**revenue, "source": "live"},
        })
        month_history.sort(key=lambda x: x["timestamp"])

    # ── 5. Hourly snapshot ──
    now_ist = datetime.now(IST)
    save_hourly_snapshot(revenue, now_ist)

    # ── 7. Supabase ──
    sb = get_supabase()
    if sb:
        supabase_upsert(sb, ts_iso, market_status, revenue)

    # ── 8. Write nse_live.json ──
    payload = {
        "updated_at":    ts_iso,
        "market_status": market_status,
        "revenue":       revenue,
        "history":       month_history,
    }
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(payload, indent=2, default=str))
    size     = OUTPUT_FILE.stat().st_size
    hist_len = len(month_history)
    print(f"Wrote {OUTPUT_FILE} ({size} bytes, {hist_len} history entries)")


if __name__ == "__main__":
    main()
