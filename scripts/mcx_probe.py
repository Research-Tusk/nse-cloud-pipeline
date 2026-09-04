"""
One-off diagnostic: can we reach MCX's site/API from a GitHub Actions
runner using the same curl_cffi Chrome-impersonation approach that already
works for NSE/BSE? Not part of the regular pipeline — meant to be run once
via workflow_dispatch and then deleted.
"""

from curl_cffi import requests as cffi_requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://www.mcxindia.com/",
}

TARGETS = [
    "https://www.mcxindia.com/market-data/market-watch",
    "https://www.mcxindia.com/",
    "https://www.mcxindia.com/backpage.aspx/GetMarketWatch",
]

session = cffi_requests.Session()
session.headers.update(HEADERS)

for url in TARGETS:
    print(f"\n=== {url} ===")
    try:
        r = session.get(url, impersonate="chrome", timeout=15)
        print(f"status: {r.status_code}")
        print(f"content-type: {r.headers.get('content-type')}")
        print(f"body length: {len(r.text)}")
        print(f"first 500 chars:\n{r.text[:500]}")
    except Exception as e:
        print(f"ERROR: {e}")
