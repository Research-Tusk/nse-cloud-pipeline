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
