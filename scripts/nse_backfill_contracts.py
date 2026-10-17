"""
Backfill per-segment F&O contract counts (if/sf/io/so_contracts) for NSE history.

Fetches the NSE tbg F&O archive month by month (same API as nse_pipeline.py) from
April 2023 to the current month, then:
  * always patches daily_all in data/dashboard_data.json and
    dashboard/data/nse_dashboard_data.json (so analysis can use it immediately);
  * if SUPABASE_URL / SUPABASE_KEY are set, updates existing nse_daily rows
    (requires supabase_migrations/2026-10-12_nse_segment_contracts.sql applied).

Integrity check: for every patched date the four segments must sum to
total_contracts; mismatches are reported and not written.

Usage: python scripts/nse_backfill_contracts.py [--start 2023-04] [--no-supabase]
"""

import argparse
import json
import os
import time
from datetime import date, datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
JSON_PATHS = [PROJECT_ROOT / "data" / "dashboard_data.json",
              PROJECT_ROOT / "dashboard" / "data" / "nse_dashboard_data.json"]
COLS = {"if_contracts": "Index_Futures_QTY", "sf_contracts": "Stock_Futures_QTY",
        "io_contracts": "Index_Options_QTY", "so_contracts": "Stock_Options_QTY"}


def months_from(start_ym):
    y, m = map(int, start_ym.split("-"))
    today = date.today()
    while (y, m) <= (today.year, today.month):
        yield y, m
        m += 1
        if m > 12:
            y, m = y + 1, 1


def fetch_month(session, y, m):
    mon = date(y, m, 1).strftime("%b")
    url = f"https://www.nseindia.com/api/historicalOR/fo/tbg/daily?month={mon}&year={y}"
    for attempt in range(3):
        try:
            r = session.get(url, impersonate="chrome", timeout=30)
            if r.status_code == 200:
                return r.json().get("data", [])
        except Exception as e:
            print(f"  {mon}-{y} attempt {attempt + 1} failed: {e}")
        time.sleep(3 * (attempt + 1))
    return []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", default="2023-04")
    ap.add_argument("--no-supabase", action="store_true")
    args = ap.parse_args()

    from curl_cffi import requests as cffi_requests
    session = cffi_requests.Session()
    session.get("https://www.nseindia.com/", impersonate="chrome", timeout=30)

    by_date = {}
    for y, m in months_from(args.start):
        rows = fetch_month(session, y, m)
        for rec in rows:
            d = rec.get("data", rec)
            ds = datetime.strptime(d.get("date", d.get("F_TIMESTAMP", "")), "%d-%b-%Y").date().isoformat()
            vals = {c: int(d.get(f, 0) or 0) for c, f in COLS.items()}
            vals["_total"] = int(d.get("F&O_Total_QTY", 0) or 0)
            by_date[ds] = vals
        print(f"  {y}-{m:02d}: {len(rows)} days")
        time.sleep(1.5)

    bad = [d for d, v in by_date.items()
           if sum(v[c] for c in COLS) != v["_total"]]
    if bad:
        print(f"WARNING: {len(bad)} date(s) where segments != F&O_Total_QTY, skipped: {bad[:10]}")
    good = {d: {c: v[c] for c in COLS} for d, v in by_date.items() if d not in bad}
    print(f"Fetched segment contracts for {len(good)} dates")

    for path in JSON_PATHS:
        if not path.exists():
            continue
        with open(path) as f:
            data = json.load(f)
        patched = 0
        for key in ("daily_all", "daily"):
            for row in data.get(key, []):
                v = good.get(row["date"])
                if v:
                    if row.get("total_contracts") and sum(v.values()) != int(row["total_contracts"]):
                        print(f"  note: {row['date']} stored total {row['total_contracts']} "
                              f"!= segment sum {sum(v.values())}")
                    row.update(v)
                    patched += key == "daily_all"
        with open(path, "w") as f:
            json.dump(data, f, separators=(",", ":"))
        print(f"Patched {patched} daily_all rows in {path.relative_to(PROJECT_ROOT)}")

    url, key = os.environ.get("SUPABASE_URL", ""), os.environ.get("SUPABASE_KEY", "")
    if args.no_supabase or not url or not key:
        print("Supabase not updated (no credentials or --no-supabase)")
        return
    from supabase import create_client
    sb = create_client(url, key)
    existing = {r["date"] for r in sb.table("nse_daily").select("date").execute().data}
    n = 0
    for ds, v in sorted(good.items()):
        if ds in existing:
            sb.table("nse_daily").update(v).eq("date", ds).execute()
            n += 1
    print(f"Updated {n} nse_daily rows in Supabase")


if __name__ == "__main__":
    main()
