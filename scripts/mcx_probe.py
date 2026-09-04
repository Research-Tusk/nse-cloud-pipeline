"""
One-off diagnostic: can we reach MCX's site/API from a GitHub Actions
runner using the same curl_cffi Chrome-impersonation approach that already
works for NSE/BSE? Not part of the regular pipeline — meant to be run once
via workflow_dispatch and then deleted.
"""

import re
from curl_cffi import requests as cffi_requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://www.mcxindia.com/",
}

session = cffi_requests.Session()
session.headers.update(HEADERS)

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
        calls = re.findall(
            r'(?:url\s*[:=]\s*["\']([^"\']{3,150})["\']'
            r'|\$\.(?:get|post|ajax|getJSON)\(\s*["\']([^"\']+)["\']'
            r'|fetch\(\s*["\']([^"\']+)["\'])',
            js,
        )
        uniq = sorted({x for tup in calls for x in tup if x})
        print(f"--- {len(uniq)} unique url-like matches ---")
        for u in uniq:
            print(u)
    except Exception as e:
        print(f"\n=== {js_url} === ERROR: {e}")
