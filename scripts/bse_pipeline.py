"""
BSE Cloud Pipeline — GitHub Actions Daily Updater
Fetches BSE derivatives and cash data via curl_cffi, upserts to Supabase,
recomputes all aggregates, writes bse_dashboard_data.json + bse_enriched_data.json
for Vercel static build.

Environment variables (set as GitHub Secrets):
  SUPABASE_URL        — e.g. https://xxxx.supabase.co
  SUPABASE_KEY        — service_role key (not anon)
"""

import json
import os
import sys
import re
from datetime import datetime, timedelta
from pathlib import Path
from collections import OrderedDict


# Load .env for local development
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── Config ──
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
DASHBOARD_DIR = PROJECT_ROOT / "dashboard"

# ── BSE Take Rates (both sides combined) ──
TR_FUT  = 0           # Futures: 0 on turnover
TR_OPT  = 0.00065     # Options: on premium turnover
TR_CASH = 7.5e-05     # Cash: on traded value


# ═══════════════════════════════════════════════════════════════
# ═══════════════════════════════════════════════════════════════
# SECTION 1: BSE DATA FETCHER (curl_cffi + ASP.NET postback)
# ═══════════════════════════════════════════════════════════════

def _get_form_data(html):
    """Extract all hidden input fields from ASP.NET page."""
    fields = re.findall(r'<input[^>]*name="([^"]*)"[^>]*value="([^"]*)"', html)
    return {name: value for name, value in fields}


def _postback(session, url, html, event_target):
    """Perform an ASP.NET __doPostBack and return the response HTML."""
    form = _get_form_data(html)
    form['__EVENTTARGET'] = event_target
    form['__EVENTARGUMENT'] = ''
    form.pop('ctl00$ContentPlaceHolder1$btnSubmit', None)
    resp = session.post(
        url, data=form, impersonate="chrome",
        headers={'Referer': url, 'Origin': 'https://www.bseindia.com'}
    )
    if resp.status_code != 200:
        print(f"  ERROR: postback returned {resp.status_code} for {event_target}")
        return None
    return resp.text


def _find_postback_targets(html, pattern):
    """Find __doPostBack targets matching a pattern (HTML-encoded quotes)."""
    return re.findall(r"__doPostBack\(&#39;(" + pattern + r")&#39;", html)


def fetch_bse_fo_data():
    """Fetch BSE F&O daily data via 3-step ASP.NET postback drill-down."""
    try:
        from curl_cffi import requests as cffi_requests
    except ImportError:
        print("ERROR: curl_cffi not installed. Run: pip install curl_cffi")
        sys.exit(1)

    session = cffi_requests.Session()
    url = "https://www.bseindia.com/markets/keystatics/Keystat_turnover_deri.aspx"
    print(f"Fetching BSE F&O page: {url}")

    # Step 1: GET the yearly summary page
    resp = session.get(url, impersonate="chrome")
    if resp.status_code != 200:
        print(f"ERROR: BSE F&O page returned {resp.status_code}")
        return []

    # Step 2: Click a FY year link to get monthly data.
    # At the start of a new financial year, year_targets[0] is the new FY with no months
    # yet published. Fall back to year_targets[1] (previous FY) in that case.
    year_targets = _find_postback_targets(resp.text, r'[^&]*gvReport_total[^&]*Linkbtn[^&]*')
    if not year_targets:
        print("ERROR: No year links found on BSE F&O page")
        return []

    base_html = resp.text  # save original page state; needed to postback different years

    # Step 3: Try each FY year in order until we find one with month links
    all_rows = []
    found_months = False

    for year_idx, year_target in enumerate(year_targets[:2]):
        html_months = _postback(session, url, base_html, year_target)
        if not html_months:
            continue

        month_targets = _find_postback_targets(html_months, r'[^&]*gvYearwise_T[^&]*lnkMonth_T[^&]*')
        if not month_targets:
            print(f"  No months in FY year index {year_idx}, trying next year")
            continue

        found_months = True
        # Fetch current month + previous month for safety
        months_to_fetch = month_targets[:2]
        current_html = html_months

        for i, target in enumerate(months_to_fetch):
            year_val = re.search(rf'hdnYear_{i}"[^>]*value="(\d+)"', current_html)
            month_val = re.search(rf'hdnMonth_{i}"[^>]*value="(\d+)"', current_html)
            ctx_year = int(year_val.group(1)) if year_val else datetime.now().year
            ctx_month = int(month_val.group(1)) if month_val else datetime.now().month

            html_daily = _postback(session, url, current_html, target)
            if not html_daily:
                continue

            rows = _parse_fo_daily_table(html_daily, ctx_year, ctx_month)
            all_rows.extend(rows)
            print(f"  F&O month {ctx_year}-{ctx_month:02d}: {len(rows)} daily rows")
            current_html = html_daily  # use latest page state for next postback

        break  # stop after first year that has months

    if not found_months:
        print("ERROR: No month links found in any FY year on BSE F&O page")
        return []

    print(f"BSE F&O rows extracted: {len(all_rows)}")
    return all_rows


def _parse_fo_daily_table(html, ctx_year, ctx_month):
    """Parse the daily F&O table (gvdaliy_T_new) from BSE HTML."""
    rows = []
    # Table: Date | Total Contracts | Total Turnover | OI Contracts | OI Value |
    #        Futures Turnover | Options Notional | Options Premium
    pattern = re.compile(
        r'<td[^>]*class="TTRow"[^>]*>\s*([A-Za-z]{3}\s+\d{1,2})\s*</td>'
        r'\s*<td[^>]*class="TTRow"[^>]*>\s*([\d,.-]+)\s*</td>'   # contracts
        r'\s*<td[^>]*class="TTRow"[^>]*>\s*([\d,.-]+)\s*</td>'   # total turnover
        r'\s*<td[^>]*class="TTRow"[^>]*>\s*([\d,.-]+)\s*</td>'   # OI contracts
        r'\s*<td[^>]*class="TTRow"[^>]*>\s*([\d,.-]+)\s*</td>'   # OI value
        r'\s*<td[^>]*class="TTRow"[^>]*>\s*([\d,.-]+)\s*</td>'   # futures turnover
        r'\s*<td[^>]*class="TTRow"[^>]*>\s*([\d,.-]+)\s*</td>'   # options notional
        r'\s*<td[^>]*class="TTRow"[^>]*>\s*([\d,.-]+)\s*</td>',  # options premium
        re.DOTALL | re.IGNORECASE
    )

    for m in pattern.finditer(html):
        try:
            date_label = m.group(1).strip()  # e.g., "Mar 02"
            # Parse with context year: "Mar 02" -> "Mar 02 2026"
            dt = datetime.strptime(f"{date_label} {ctx_year}", "%b %d %Y")
            rows.append({
                "date": f"{dt.day:02d}/{dt.month:02d}/{dt.year}",
                "total_contracts": clean_number(m.group(2)),
                "total_turnover": clean_number(m.group(3)),
                "futures_turnover": clean_number(m.group(6)),
                "options_notional_turnover": clean_number(m.group(7)),
                "options_premium_turnover": clean_number(m.group(8)),
            })
        except (ValueError, IndexError) as e:
            print(f"  Warning: skipping F&O row: {e}")
            continue

    return rows


def fetch_bse_cash_data():
    """Fetch BSE Cash market daily data via 3-step ASP.NET postback."""
    try:
        from curl_cffi import requests as cffi_requests
    except ImportError:
        print("ERROR: curl_cffi not installed. Run: pip install curl_cffi")
        sys.exit(1)

    session = cffi_requests.Session()
    url = "https://www.bseindia.com/markets/Equity/EQReports/Historical_EquitySegment.aspx"
    print(f"Fetching BSE Cash page: {url}")

    # Step 1: GET yearly summary
    resp = session.get(url, impersonate="chrome")
    if resp.status_code != 200:
        print(f"ERROR: BSE Cash page returned {resp.status_code}")
        return []

    # Step 2: Click current year to get monthly view
    year_targets = _find_postback_targets(resp.text, r'[^&]*gvReport[^&]*lnkyear[^&]*')
    if not year_targets:
        print("ERROR: No year links found on BSE Cash page")
        return []

    html_months = _postback(session, url, resp.text, year_targets[0])
    if not html_months:
        return []

    # Step 3: Click each recent month to get daily data
    month_targets = _find_postback_targets(html_months, r'[^&]*gvYearwise[^&]*Linkbtn[^&]*')
    if not month_targets:
        print("ERROR: No month links found on BSE Cash page")
        return []

    all_rows = []
    months_to_fetch = month_targets[:2]
    current_html = html_months

    for target in months_to_fetch:
        html_daily = _postback(session, url, current_html, target)
        if not html_daily:
            continue

        rows = _parse_cash_daily_table(html_daily)
        all_rows.extend(rows)
        print(f"  Cash month: {len(rows)} daily rows")
        current_html = html_daily

    print(f"BSE Cash rows extracted: {len(all_rows)}")
    return all_rows


def _parse_cash_daily_table(html):
    """Parse the daily Cash table (grddaily) from BSE HTML."""
    rows = []
    # Table: Date | No. of Company Trades | Total No. of Trades | No. of Shares (Cr) | Net Turnover
    pattern = re.compile(
        r'<td[^>]*class="tdcolumn[^"]*"[^>]*>\s*(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\s*</td>'
        r'\s*<td[^>]*class="tdcolumn[^"]*"[^>]*>\s*([\d,.-]+)\s*</td>'   # companies traded
        r'\s*<td[^>]*class="tdcolumn[^"]*"[^>]*>\s*([\d,.-]+)\s*</td>'   # total trades
        r'\s*<td[^>]*class="tdcolumn[^"]*"[^>]*>\s*([\d,.-]+)\s*</td>'   # shares
        r'\s*<td[^>]*class="tdcolumn[^"]*"[^>]*>\s*([\d,.-]+)\s*</td>',  # net turnover
        re.DOTALL | re.IGNORECASE
    )

    for m in pattern.finditer(html):
        try:
            date_str = m.group(1).strip()  # "02 Mar 2026"
            dt = datetime.strptime(date_str, "%d %b %Y")
            rows.append({
                "date": f"{dt.day:02d}/{dt.month:02d}/{dt.year}",
                "securities_traded": clean_number(m.group(2)),
                "no_of_trades": clean_number(m.group(3)),
                "traded_quantity": clean_number(m.group(4)),
                "traded_value": clean_number(m.group(5)),
            })
        except (ValueError, IndexError) as e:
            print(f"  Warning: skipping cash row: {e}")
            continue

    return rows




def clean_number(s):
    """Clean a number string: remove commas, handle empty."""
    if not s or s.strip() == '-':
        return 0
    return float(s.replace(',', '').strip())


# ═══════════════════════════════════════════════════════════════
# SECTION 2: DATA PARSING
# ═══════════════════════════════════════════════════════════════

def date_to_fy_quarter(dt):
    m, y = dt.month, dt.year
    if m >= 4:
        fy_year = y + 1
        q = 1 if m <= 6 else (2 if m <= 9 else 3)
    else:
        fy_year = y
        q = 4
    return f"Q{q} FY {fy_year}"

def date_to_fy_month(dt):
    fy_year = dt.year + 1 if dt.month >= 4 else dt.year
    return f"FY {fy_year} {dt.strftime('%B')}"

def date_to_fy(dt):
    fy_year = dt.year + 1 if dt.month >= 4 else dt.year
    return f"FY {fy_year}"


def parse_fo_record(rec):
    """Parse one BSE F&O daily row into the standard format."""
    date_str = rec.get("date", "")
    dt = None
    for fmt_str in ["%Y-%m-%d", "%d/%m/%Y", "%d-%b-%Y", "%d-%m-%Y", "%d %b %Y"]:
        try:
            dt = datetime.strptime(date_str, fmt_str)
            break
        except ValueError:
            continue
    if dt is None:
        raise ValueError(f"Cannot parse date: {date_str}")

    fut_to = float(rec.get("futures_turnover", 0) or 0)
    opt_prem = float(rec.get("options_premium_turnover", 0) or 0)
    opt_notional = float(rec.get("options_notional_turnover", 0) or 0)
    total_contracts = int(float(rec.get("total_contracts", 0) or 0))
    total_to = float(rec.get("total_turnover", 0) or 0)

    fut_rev = fut_to * TR_FUT
    opt_rev = opt_prem * TR_OPT
    fo_rev = fut_rev + opt_rev
    pn_ratio = opt_prem / opt_notional if opt_notional > 0 else 0

    return {
        "date": dt.strftime("%Y-%m-%d"),
        "day": dt.strftime("%A"),
        "fy_quarter": date_to_fy_quarter(dt),
        "fy_month": date_to_fy_month(dt),
        "fy": date_to_fy(dt),
        "total_contracts": total_contracts,
        "total_turnover": round(total_to, 2),
        "futures_turnover": round(fut_to, 2),
        "options_notional_turnover": round(opt_notional, 2),
        "options_premium_turnover": round(opt_prem, 2),
        "fut_rev": round(fut_rev, 4),
        "opt_rev": round(opt_rev, 4),
        "fo_rev": round(fo_rev, 4),
        "pn_ratio": round(pn_ratio, 6),
        "_dt": dt,
    }


def parse_cash_record(rec):
    """Parse one BSE Cash daily row."""
    date_str = rec.get("date", "")
    dt = None
    for fmt_str in ["%Y-%m-%d", "%d/%m/%Y", "%d-%b-%Y", "%d-%m-%Y", "%d %b %Y"]:
        try:
            dt = datetime.strptime(date_str, fmt_str)
            break
        except ValueError:
            continue
    if dt is None:
        raise ValueError(f"Cannot parse date: {date_str}")

    cash_traded_value = float(rec.get("traded_value", 0) or 0)
    cash_securities = int(float(rec.get("securities_traded", 0) or 0))
    cash_trades = int(float(rec.get("no_of_trades", 0) or 0))
    cash_quantity = int(float(rec.get("traded_quantity", 0) or 0))
    cash_rev = cash_traded_value * TR_CASH

    return {
        "date": dt.strftime("%Y-%m-%d"),
        "cash_traded_value": round(cash_traded_value, 2),
        "cash_securities": cash_securities,
        "cash_trades": cash_trades,
        "cash_quantity": cash_quantity,
        "cash_rev": round(cash_rev, 4),
    }


# ═══════════════════════════════════════════════════════════════
# SECTION 3: SUPABASE OPERATIONS
# ═══════════════════════════════════════════════════════════════

def get_supabase_client():
    from supabase import create_client
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_existing_dates(supabase):
    """Get all existing dates from bse_daily table."""
    result = supabase.table("bse_daily").select("date").execute()
    return {row["date"] for row in result.data}

def fetch_zero_fo_dates(supabase):
    """Get dates that exist in DB but have zero F&O revenue (data-posting lag)."""
    result = (supabase.table("bse_daily")
              .select("date")
              .eq("fo_rev", 0)
              .execute())
    return {row["date"] for row in result.data}

def upsert_daily_records(supabase, records):
    """Upsert parsed daily records into Supabase."""
    if not records:
        return 0
    clean = [{k: v for k, v in r.items() if k != "_dt"} for r in records]
    inserted = 0
    for i in range(0, len(clean), 50):
        batch = clean[i:i+50]
        supabase.table("bse_daily").upsert(batch, on_conflict="date").execute()
        inserted += len(batch)
    return inserted

def fetch_all_daily(supabase):
    """Fetch all daily records from Supabase, ordered by date."""
    all_records = []
    offset = 0
    batch_size = 1000
    while True:
        result = (supabase.table("bse_daily")
                  .select("*")
                  .order("date")
                  .range(offset, offset + batch_size - 1)
                  .execute())
        if not result.data:
            break
        all_records.extend(result.data)
        if len(result.data) < batch_size:
            break
        offset += batch_size
    return all_records

def save_aggregates(supabase, key, data):
    """Save a computed aggregate to bse_aggregates table."""
    supabase.table("bse_aggregates").upsert({
        "key": key,
        "data": data,
        "updated_at": datetime.utcnow().isoformat()
    }, on_conflict="key").execute()

def log_pipeline_run(supabase, new_days, latest_date, status="success", details=""):
    supabase.table("bse_pipeline_runs").insert({
        "new_days_added": new_days,
        "latest_date": latest_date,
        "status": status,
        "details": details,
        "source": "github_actions"
    }).execute()


# ═══════════════════════════════════════════════════════════════
# SECTION 4: AGGREGATE COMPUTATIONS
# ═══════════════════════════════════════════════════════════════

def recompute_quarterly(daily):
    quarters = OrderedDict()
    for d in daily:
        q = d["fy_quarter"]
        if q not in quarters:
            quarters[q] = {"quarter": q, "opt_rev": 0, "fut_rev": 0, "cash_rev": 0,
                           "total_rev": 0, "days": 0, "options_premium_turnover": 0,
                           "futures_turnover": 0, "cash_traded_value": 0}
        for k in ["opt_rev", "fut_rev", "cash_rev", "total_rev",
                   "options_premium_turnover", "futures_turnover", "cash_traded_value"]:
            quarters[q][k] += float(d.get(k, 0) or 0)
        quarters[q]["days"] += 1
    return [{k: round(v, 4) if isinstance(v, float) else v
             for k, v in q.items()} for q in quarters.values()]

def recompute_monthly(daily):
    months = OrderedDict()
    for d in daily:
        m = d["fy_month"]
        if m not in months:
            months[m] = {"month": m, "opt_rev": 0, "fut_rev": 0, "cash_rev": 0,
                         "total_rev": 0, "days": 0}
        for k in ["opt_rev", "fut_rev", "cash_rev", "total_rev"]:
            months[m][k] += float(d.get(k, 0) or 0)
        months[m]["days"] += 1
    return [{k: round(v, 4) if isinstance(v, float) else v
             for k, v in m.items()} for m in months.values()]

def recompute_weekly(daily):
    weeks = OrderedDict()
    for d in daily:
        dt = datetime.strptime(d["date"], "%Y-%m-%d")
        week_start = dt - timedelta(days=dt.weekday())
        wk = week_start.strftime("%Y-%m-%d")
        if wk not in weeks:
            weeks[wk] = {"week": wk, "opt_rev": 0, "fut_rev": 0, "cash_rev": 0,
                         "total_rev": 0, "days": 0}
        for k in ["opt_rev", "fut_rev", "cash_rev", "total_rev"]:
            weeks[wk][k] += float(d.get(k, 0) or 0)
        weeks[wk]["days"] += 1
    return [{k: round(v, 4) if isinstance(v, float) else v
             for k, v in w.items()} for w in weeks.values()]

def compute_summary(daily, quarterly):
    last = daily[-1] if daily else {}
    cq = quarterly[-1] if quarterly else {}
    return {
        "current_quarter": cq.get("quarter", ""),
        "last_date": last.get("date", ""),
        "total_trading_days": len(daily),
    }


# ═══════════════════════════════════════════════════════════════
# SECTION 5: ENRICHED DATA (segment summaries, predictor)
# ═══════════════════════════════════════════════════════════════

def seg_summary(daily_data, rev_key):
    q = recompute_quarterly(daily_data)
    cq = q[-1] if q else None
    pq = q[-2] if len(q) > 1 else None
    yoy_q = None
    if cq:
        parts = cq["quarter"].split()
        target_label = f"{parts[0]} FY {int(parts[2]) - 1}"
        yoy_q = next((x for x in q if x["quarter"] == target_label), None)

    cq_avg = float(cq[rev_key]) / max(cq["days"], 1) if cq else 0
    pq_avg = float(pq[rev_key]) / max(pq["days"], 1) if pq else 0
    yoy_avg = float(yoy_q[rev_key]) / max(yoy_q["days"], 1) if yoy_q else 0

    quarterly_data = {
        "current":  {"label": cq["quarter"] if cq else "", "value": round(cq_avg, 4),
                     "qoq": round((cq_avg - pq_avg) / pq_avg, 4) if pq_avg else 0,
                     "yoy": round((cq_avg - yoy_avg) / yoy_avg, 4) if yoy_avg else 0},
        "previous": {"label": pq["quarter"] if pq else "", "value": round(pq_avg, 4)},
        "prev2":    {"label": yoy_q["quarter"] if yoy_q else "", "value": round(yoy_avg, 4)},
    }

    m = recompute_monthly(daily_data)
    cm = m[-1] if m else None
    pm = m[-2] if len(m) > 1 else None
    last_6m = m[-6:] if len(m) >= 6 else m
    cm_avg = float(cm[rev_key]) / max(cm["days"], 1) if cm else 0
    pm_avg = float(pm[rev_key]) / max(pm["days"], 1) if pm else 0
    avg_6m = sum(float(x[rev_key]) / max(x["days"], 1) for x in last_6m) / max(len(last_6m), 1)

    monthly_data = {
        "current":  {"label": cm["month"] if cm else "", "value": round(cm_avg, 4),
                     "mom": round((cm_avg - pm_avg) / pm_avg, 4) if pm_avg else 0,
                     "mo6m": round((cm_avg - avg_6m) / avg_6m, 4) if avg_6m else 0},
        "previous": {"label": pm["month"] if pm else "", "value": round(pm_avg, 4)},
        "avg_6m":   {"label": "Avg Of Last 6 Months", "value": round(avg_6m, 4)},
    }

    last5 = daily_data[-5:] if len(daily_data) >= 5 else daily_data
    prev5 = daily_data[-10:-5] if len(daily_data) >= 10 else []
    last50 = daily_data[-50:] if len(daily_data) >= 50 else daily_data
    l5_avg = sum(float(d[rev_key]) for d in last5) / max(len(last5), 1)
    p5_avg = sum(float(d[rev_key]) for d in prev5) / max(len(prev5), 1) if prev5 else 0
    l50_avg = sum(float(d[rev_key]) for d in last50) / max(len(last50), 1)

    weekly_data = {
        "last5":  {"label": "Last 5 Trading Days", "value": round(l5_avg, 4),
                   "wow": round((l5_avg - p5_avg) / p5_avg, 4) if p5_avg else 0,
                   "wo10w": round((l5_avg - l50_avg) / l50_avg, 4) if l50_avg else 0},
        "prev5":  {"label": "Previous 5 Trading Days", "value": round(p5_avg, 4)},
        "last50": {"label": "Last 50 Trading Days", "value": round(l50_avg, 4)},
    }

    days_list = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    dow = {}
    for day_name in days_list:
        recs = [d for d in daily_data if d["day"] == day_name]
        latest = float(recs[-1][rev_key]) if recs else 0
        last3 = recs[-3:] if len(recs) >= 3 else recs
        last10 = recs[-10:] if len(recs) >= 10 else recs
        avg3 = sum(float(d[rev_key]) for d in last3) / max(len(last3), 1)
        avg10 = sum(float(d[rev_key]) for d in last10) / max(len(last10), 1)
        dow[day_name] = {
            "latest": round(latest, 4),
            "do3d": round((latest - avg3) / avg3, 4) if avg3 else 0,
            "do10d": round((latest - avg10) / avg10, 4) if avg10 else 0,
            "avg_3d": round(avg3, 4), "avg_10d": round(avg10, 4),
        }

    prev_week = {}
    pw_data = daily_data[-10:-5] if len(daily_data) >= 10 else []
    for d in pw_data:
        prev_week[d["day"]] = round(float(d[rev_key]), 4)

    # FY-level YoY
    fy_groups = OrderedDict()
    for d in daily_data:
        f = d["fy"]
        if f not in fy_groups:
            fy_groups[f] = {"sum": 0, "count": 0}
        fy_groups[f]["sum"] += float(d.get(rev_key, 0) or 0)
        fy_groups[f]["count"] += 1
    fy_list = list(fy_groups.values())
    curr_fy_avg = fy_list[-1]["sum"] / max(fy_list[-1]["count"], 1) if fy_list else 0
    prev_fy_avg = fy_list[-2]["sum"] / max(fy_list[-2]["count"], 1) if len(fy_list) > 1 else 0
    fy_yoy = (curr_fy_avg - prev_fy_avg) / prev_fy_avg if prev_fy_avg else 0

    return {
        "quarterly": quarterly_data,
        "monthly": monthly_data,
        "weekly": weekly_data,
        "day_of_week": dow,
        "previous_week": prev_week,
        "fy": {"current": round(curr_fy_avg, 4), "previous": round(prev_fy_avg, 4), "yoy": round(fy_yoy, 4)},
    }


def compute_enriched(daily, quarterly):
    enriched = {
        "summary_total": seg_summary(daily, "total_rev"),
        "seg_options":   seg_summary(daily, "opt_rev"),
        "seg_futures":   seg_summary(daily, "fut_rev"),
        "seg_cash":      seg_summary(daily, "cash_rev"),
    }

    # Revenue predictor
    cq = quarterly[-1] if quarterly else None
    if cq:
        days_so_far = cq["days"]
        expected_days = 62
        daily_avg = float(cq["total_rev"]) / max(days_so_far, 1)
        other_income_ratio = 0.15  # BSE ~15% other income
        txn_rev_extrap = daily_avg * expected_days
        total_rev_pred = txn_rev_extrap * (1 + other_income_ratio)
        enriched["pnl_predictor"] = {
            "daily_avg_rev": round(daily_avg, 4),
            "trading_days_so_far": days_so_far,
            "expected_trading_days": expected_days,
            "transaction_rev_extrapolated": round(txn_rev_extrap, 2),
            "other_income_ratio": round(other_income_ratio, 4),
            "total_revenue_predicted": round(total_rev_pred, 2),
        }
    else:
        enriched["pnl_predictor"] = {}

    return enriched


# ═══════════════════════════════════════════════════════════════
# SECTION 6: BUILD bse_dashboard_data.json
# ═══════════════════════════════════════════════════════════════

def build_dashboard_json(daily_all, quarterly, monthly, weekly, summary):
    daily_recent = daily_all[-120:] if len(daily_all) > 120 else daily_all
    return {
        "daily": daily_recent,
        "daily_all": daily_all,
        "monthly": monthly,
        "quarterly": quarterly,
        "weekly": weekly[-15:] if len(weekly) > 15 else weekly,
        "summary": summary,
    }


# ═══════════════════════════════════════════════════════════════
# SECTION 7: MAIN PIPELINE
# ═══════════════════════════════════════════════════════════════

def main():
    print("=" * 60)
    print("BSE Cloud Pipeline — Daily Update")
    print(f"Run time: {datetime.utcnow().isoformat()}Z")
    print("=" * 60)

    # Step 1: Fetch from BSE
    fo_rows = fetch_bse_fo_data()
    cash_rows = fetch_bse_cash_data()

    if not fo_rows and not cash_rows:
        print("No data returned from BSE. Exiting.")
        return 0

    # Step 2: Parse records
    cash_by_date = {}
    for rec in cash_rows:
        try:
            parsed = parse_cash_record(rec)
            cash_by_date[parsed["date"]] = parsed
        except Exception as e:
            print(f"Warning: skipping cash record: {e}")
            continue

    new_parsed = []
    for rec in fo_rows:
        try:
            parsed = parse_fo_record(rec)
        except Exception as e:
            print(f"Warning: skipping F&O record: {e}")
            continue
        date_key = parsed["date"]
        cm = cash_by_date.get(date_key, {})
        parsed["cash_traded_value"] = cm.get("cash_traded_value", 0)
        parsed["cash_securities"] = cm.get("cash_securities", 0)
        parsed["cash_trades"] = cm.get("cash_trades", 0)
        parsed["cash_quantity"] = cm.get("cash_quantity", 0)
        parsed["cash_rev"] = cm.get("cash_rev", 0)
        parsed["total_rev"] = round(parsed["fo_rev"] + parsed["cash_rev"], 4)
        del parsed["_dt"]
        new_parsed.append(parsed)

    # Also handle cash-only dates
    fo_dates = {r["date"] for r in new_parsed}
    for date_key, cm in cash_by_date.items():
        if date_key not in fo_dates:
            dt = datetime.strptime(date_key, "%Y-%m-%d")
            new_parsed.append({
                "date": date_key,
                "day": dt.strftime("%A"),
                "fy_quarter": date_to_fy_quarter(dt),
                "fy_month": date_to_fy_month(dt),
                "fy": date_to_fy(dt),
                "total_contracts": 0,
                "total_turnover": 0,
                "futures_turnover": 0,
                "options_notional_turnover": 0,
                "options_premium_turnover": 0,
                "fut_rev": 0,
                "opt_rev": 0.0,
                "fo_rev": 0.0,
                "cash_traded_value": cm.get("cash_traded_value", 0),
                "cash_securities": cm.get("cash_securities", 0),
                "cash_trades": cm.get("cash_trades", 0),
                "cash_quantity": cm.get("cash_quantity", 0),
                "cash_rev": cm.get("cash_rev", 0),
                "total_rev": cm.get("cash_rev", 0),
                "pn_ratio": 0,
            })

    if not fo_rows and cash_rows:
        print(f"WARNING: BSE F&O returned 0 records while cash data has "
              f"{len(cash_rows)} record(s). Likely a data-posting delay — "
              "re-run pipeline after BSE publishes F&O data.")

    print(f"Parsed {len(new_parsed)} records from BSE")

    # Step 3: Supabase operations
    to_insert = new_parsed  # default
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("WARNING: Supabase credentials not set. Writing local files only.")
        supabase = None
    else:
        supabase = get_supabase_client()
        existing_dates = get_existing_dates(supabase)
        zero_fo_dates = fetch_zero_fo_dates(supabase)
        to_insert = [r for r in new_parsed
                     if r["date"] not in existing_dates or r["date"] in zero_fo_dates]
        print(f"Existing dates in DB: {len(existing_dates)}, "
              f"Zero-F&O dates to re-upsert: {len(zero_fo_dates & {r['date'] for r in new_parsed})}, "
              f"Records to upsert: {len(to_insert)}")

        if to_insert:
            upsert_daily_records(supabase, to_insert)
            print(f"Upserted {len(to_insert)} new daily records to Supabase")
        else:
            print("No new records to insert into Supabase")

    # Step 4: Fetch full dataset and recompute
    if supabase:
        all_daily = fetch_all_daily(supabase)
    else:
        existing_path = DATA_DIR / "bse_dashboard_data.json"
        if existing_path.exists():
            with open(existing_path) as f:
                existing = json.load(f)
            all_daily = existing.get("daily_all", [])
            existing_dates_local = {d["date"] for d in all_daily}
            new_local = [r for r in new_parsed if r["date"] not in existing_dates_local]
            all_daily = sorted(all_daily + new_local, key=lambda x: x["date"])
        else:
            all_daily = sorted(new_parsed, key=lambda x: x["date"])

    print(f"Total daily records: {len(all_daily)}")

    # Step 5: Recompute aggregates
    quarterly = recompute_quarterly(all_daily)
    monthly   = recompute_monthly(all_daily)
    weekly    = recompute_weekly(all_daily)
    summary_obj = compute_summary(all_daily, quarterly)

    # Step 6: Build enriched data
    enriched = compute_enriched(all_daily, quarterly)

    # Step 7: Save aggregates to Supabase
    if supabase:
        save_aggregates(supabase, "quarterly", quarterly)
        save_aggregates(supabase, "monthly", monthly)
        save_aggregates(supabase, "weekly", weekly)
        save_aggregates(supabase, "summary", summary_obj)
        save_aggregates(supabase, "enriched", enriched)
        new_count = len(to_insert)
        log_pipeline_run(supabase, new_count, summary_obj.get("last_date", ""),
                         details=f"Total records: {len(all_daily)}")
        print("Saved aggregates to Supabase")

    # Step 8: Write local JSON files (for git commit → Vercel deploy)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    dashboard_json = build_dashboard_json(all_daily, quarterly, monthly, weekly, summary_obj)

    with open(DATA_DIR / "bse_dashboard_data.json", "w") as f:
        json.dump(dashboard_json, f, separators=(',', ':'))
    with open(DATA_DIR / "bse_enriched_data.json", "w") as f:
        json.dump(enriched, f, separators=(',', ':'))

    print(f"Wrote {DATA_DIR / 'bse_dashboard_data.json'}")
    print(f"Wrote {DATA_DIR / 'bse_enriched_data.json'}")

    # Also write to dashboard/data/ (for unified dashboard fetch())
    dash_data_dir = DASHBOARD_DIR / "data"
    dash_data_dir.mkdir(parents=True, exist_ok=True)
    with open(dash_data_dir / "bse_dashboard_data.json", "w") as f:
        json.dump(dashboard_json, f, separators=(',', ':'))
    with open(dash_data_dir / "bse_enriched_data.json", "w") as f:
        json.dump(enriched, f, separators=(',', ':'))
    print(f"Wrote {dash_data_dir / 'bse_dashboard_data.json'}")
    print(f"Wrote {dash_data_dir / 'bse_enriched_data.json'}")

    # Summary
    new_count_final = len(to_insert) if supabase else len(new_parsed)
    print("\n" + "=" * 60)
    print(f"Pipeline complete.")
    print(f"  Latest date: {summary_obj.get('last_date', 'N/A')}")
    print(f"  Total daily records: {len(all_daily)}")
    print(f"  Current quarter: {summary_obj.get('current_quarter', 'N/A')}")
    print(f"  New days this run: {new_count_final}")
    print("=" * 60)

    return new_count_final


if __name__ == "__main__":
    count = main()
    count_file = PROJECT_ROOT / ".new_bse_days_count"
    count_file.write_text(str(count or 0))
