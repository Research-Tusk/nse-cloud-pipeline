"""
Thin DhanHQ v2 REST client (https://dhanhq.co/docs/v2/).

Environment variables (GitHub secret / Vercel env — never commit):
  DHAN_CLIENT_ID
  DHAN_ACCESS_TOKEN

Every call returns None on any failure (missing/expired token, HTTP error, rate
limit) and logs a warning, so callers can fall back to Yahoo / NSE without failing
the pipeline. Security ids verified against the public scrip master
(https://images.dhan.co/api-data/api-scrip-master.csv).
"""

import os
import time
from datetime import datetime, timezone, timedelta

BASE_URL = "https://api.dhan.co/v2"

# segment "IDX_I", instrument "INDEX"
SECURITY = {
    "NIFTY": 13,
    "INDIA_VIX": 21,
    "BANKNIFTY": 25,
    "SENSEX": 51,
    "BANKEX": 69,
}

IST = timezone(timedelta(hours=5, minutes=30))


def _creds():
    cid = os.environ.get("DHAN_CLIENT_ID", "").strip()
    tok = os.environ.get("DHAN_ACCESS_TOKEN", "").strip()
    return (cid, tok) if cid and tok else (None, None)


def available():
    return _creds()[0] is not None


def _post(path, body, retries=3, timeout=30):
    cid, tok = _creds()
    if not cid:
        print(f"INFO: Dhan credentials not set — skipping {path}")
        return None
    import requests
    headers = {"access-token": tok, "client-id": cid,
               "Content-Type": "application/json", "Accept": "application/json"}
    for attempt in range(retries):
        try:
            r = requests.post(BASE_URL + path, json=body, headers=headers, timeout=timeout)
            if r.status_code == 429:
                time.sleep(3 * (attempt + 1))
                continue
            if r.status_code in (401, 403):
                print(f"WARNING: Dhan auth failed on {path} ({r.status_code}) — token expired?")
                return None
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt == retries - 1:
                print(f"WARNING: Dhan {path} failed (non-fatal): {e}")
                return None
            time.sleep(2 * (attempt + 1))
    return None


def historical_daily(security_id, from_date, to_date, segment="IDX_I", instrument="INDEX"):
    """Daily candles. Returns {iso_date: {open, high, low, close, volume}} or None.
    to_date is exclusive per Dhan docs, so callers should pass end + 1 day."""
    j = _post("/charts/historical", {
        "securityId": str(security_id), "exchangeSegment": segment,
        "instrument": instrument, "expiryCode": 0, "oi": False,
        "fromDate": str(from_date)[:10], "toDate": str(to_date)[:10],
    })
    if not j or not j.get("timestamp"):
        return None
    out = {}
    for i, ts in enumerate(j["timestamp"]):
        d = datetime.fromtimestamp(ts, IST).date().isoformat()
        out[d] = {k: j[k][i] for k in ("open", "high", "low", "close", "volume") if k in j}
    return out


def india_vix_daily(from_date, to_date):
    """{iso_date: close} for INDIA VIX, or None."""
    to_excl = (datetime.strptime(str(to_date)[:10], "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
    h = historical_daily(SECURITY["INDIA_VIX"], from_date, to_excl)
    return {d: round(float(v["close"]), 4) for d, v in h.items()} if h else None


def expiry_list(underlying="NIFTY"):
    j = _post("/optionchain/expirylist",
              {"UnderlyingScrip": SECURITY[underlying], "UnderlyingSeg": "IDX_I"})
    return sorted(j.get("data", [])) if j else None


def option_chain(underlying, expiry):
    """Raw option chain {last_price, oc{strike: {ce, pe}}} or None.
    Dhan limits option-chain calls to 1 per 3 s — callers must space requests."""
    j = _post("/optionchain", {"UnderlyingScrip": SECURITY[underlying],
                               "UnderlyingSeg": "IDX_I", "Expiry": expiry})
    return j.get("data") if j else None
