"""
One-off diagnostic: can we reach MCX's site/API from a GitHub Actions
runner using the same curl_cffi Chrome-impersonation approach that already
works for NSE/BSE? Not part of the regular pipeline — meant to be run once
via workflow_dispatch and then deleted.

FOUND (via real-browser Network tab inspection): the market-watch page
calls GET /market-data/market-watch/GetMarketWatch?culture=en (note: "en",
NOT "en-US" -- that was the reason earlier guesses 404'd) and gets back a
JSON payload with live per-contract data for all ~3100 active MCX
contracts: Symbol, InstrumentName (FUTCOM/OPTFUT), Volume, ValueInLacs
(turnover), etc. This final check verifies that endpoint works as a COLD,
STATELESS call (fresh session, no prior page load, no cookies) since
that's how a real poller would call it.
"""

import json
import re
from curl_cffi import requests as cffi_requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://www.mcxindia.com/market-data/market-watch",
}

session = cffi_requests.Session()
session.headers.update(HEADERS)

print("=== COLD stateless call to GetMarketWatch (no prior page load) ===")
cold_url = "https://www.mcxindia.com/market-data/market-watch/GetMarketWatch?culture=en"
cr = session.get(cold_url, impersonate="chrome", timeout=15)
print(f"status: {cr.status_code}, content-type: {cr.headers.get('content-type')}, length: {len(cr.text)}")
if cr.status_code == 200:
    try:
        payload = cr.json()
        rows = payload.get("data", {}).get("Data", [])
        print(f"success={payload.get('success')}, AsOn={payload.get('data',{}).get('Summary',{}).get('AsOn')}, rows={len(rows)}")
        by_instr = {}
        for r in rows:
            k = r.get("InstrumentName")
            by_instr.setdefault(k, {"count": 0, "value_lacs": 0.0, "volume": 0})
            by_instr[k]["count"] += 1
            by_instr[k]["value_lacs"] += r.get("ValueInLacs") or 0
            by_instr[k]["volume"] += r.get("Volume") or 0
        print("--- breakdown by InstrumentName ---")
        for k, v in by_instr.items():
            print(f"{k}: {v['count']} contracts, volume={v['volume']}, ValueInLacs sum={v['value_lacs']:.2f}")
        print("--- sample row ---")
        print(json.dumps(rows[0], indent=2) if rows else "no rows")
    except Exception as e:
        print(f"JSON parse error: {e}")
        print(repr(cr.text[:500]))
print()

url = "https://www.mcxindia.com/market-data/market-watch"
r = session.get(url, impersonate="chrome", timeout=15)
html = r.text
print(f"status: {r.status_code}, length: {len(html)}")

# Look for script src references and inline API/ajax call patterns
srcs = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', html)
print(f"\n--- {len(srcs)} <script src=...> references ---")
for s in srcs:
    print(s)

# Look for common AJAX/API call patterns (jQuery.ajax, fetch, url:, PageMethods, etc.)
patterns = re.findall(r'(?:url\s*[:=]\s*["\']([^"\']{3,120})["\']|PageMethods\.(\w+)|\.ajax\(\{[^}]*?url\s*:\s*["\']([^"\']+)["\'])', html)
print(f"\n--- {len(patterns)} url:/PageMethods/.ajax matches ---")
for p in patterns[:40]:
    print([x for x in p if x])

# Look for any /backpage.aspx or similar service call by name
service_calls = set(re.findall(r'["\']([\w./-]*(?:\.aspx|\.asmx|/api/)[\w./-]*)["\']', html))
print(f"\n--- {len(service_calls)} .aspx/.asmx/api path references ---")
for s in sorted(service_calls):
    print(s)

# Grep for anything mentioning "turnover", "segment", "value in cr", table headers
for kw in ["Turnover", "turnover", "MarketWatch", "GetMarket", "Volume", "premium"]:
    idxs = [m.start() for m in re.finditer(re.escape(kw), html)][:3]
    if idxs:
        print(f"\n--- context around '{kw}' (first {len(idxs)} hits) ---")
        for i in idxs:
            print(repr(html[max(0, i-80):i+80]))

# Fetch the JS files that likely drive the market-watch table and search
# them for the actual AJAX/fetch endpoint.
js_files = [
    "/assets/customjs/marketWatch.js",
    "/assets/customjs/data.js",
    "/assets/js/market-data.js",
]
for path in js_files:
    js_url = "https://www.mcxindia.com" + path.split("?")[0]
    try:
        jr = session.get(js_url, impersonate="chrome", timeout=15)
        js = jr.text
        print(f"\n=== {js_url} === status {jr.status_code}, length {len(js)}")

        # Broad net: any quoted string containing a slash (likely a path),
        # any mention of http(s), any of these keywords.
        quoted_paths = set(re.findall(r'["\']([^"\']*/[^"\']{2,150})["\']', js))
        quoted_paths = {p for p in quoted_paths if not p.startswith(('http://www.w3','data:'))}
        print(f"--- {len(quoted_paths)} quoted strings containing '/' ---")
        for p in sorted(quoted_paths)[:60]:
            print(p)

        for kw in ["http", "Service", "signalR", "socket", "GetData", "hub", "Hub"]:
            idxs = [m.start() for m in re.finditer(re.escape(kw), js)][:5]
            if idxs:
                print(f"--- context around '{kw}' ({len(idxs)} shown) ---")
                for i in idxs:
                    print(repr(js[max(0, i-60):i+60]))
    except Exception as e:
        print(f"\n=== {js_url} === ERROR: {e}")

# Print the full GetData / GetDataUrl function bodies from data.js verbatim
data_js_url = "https://www.mcxindia.com/assets/customjs/data.js"
dr = session.get(data_js_url, impersonate="chrome", timeout=15)
djs = dr.text
for fn in ["function GetData(", "function GetDataSynchronus(", "function GetDataUrl("]:
    i = djs.find(fn)
    if i >= 0:
        end = djs.find("\n}", i)
        print(f"\n=== {fn} body ===")
        print(djs[i:end+2])

# Also print the marketWatch.js snippet around the GetMarketWatch call for full context
mw_url = "https://www.mcxindia.com/assets/customjs/marketWatch.js"
mr = session.get(mw_url, impersonate="chrome", timeout=15)
mjs = mr.text
i = mjs.find("GetMarketWatch")
if i >= 0:
    print("\n=== marketWatch.js context around GetMarketWatch call ===")
    print(mjs[max(0, i-500):i+800])

# Now actually TRY calling the endpoint a few plausible ways.
candidates = [
    ("GET",  "https://www.mcxindia.com/GetMarketWatch?culture=en-US"),
    ("GET",  "https://www.mcxindia.com/market-data/market-watch/GetMarketWatch?culture=en-US"),
    ("POST", "https://www.mcxindia.com/market-data/market-watch/GetMarketWatch?culture=en-US"),
    ("POST", "https://www.mcxindia.com/GetMarketWatch?culture=en-US"),
]
print("\n=== live endpoint attempts ===")
for method, curl in candidates:
    try:
        if method == "GET":
            cr = session.get(curl, impersonate="chrome", timeout=15)
        else:
            cr = session.post(curl, impersonate="chrome", timeout=15, json={})
        print(f"{method} {curl} -> {cr.status_code}, len={len(cr.text)}, ct={cr.headers.get('content-type')}")
        print(repr(cr.text[:300]))
    except Exception as e:
        print(f"{method} {curl} -> ERROR: {e}")
