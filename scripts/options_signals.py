"""
Daily options-market snapshot for NIFTY (NSE) and SENSEX (BSE) via Dhan.

Records near-week expiry ATM implied volatility, total call/put OI and PCR into
dashboard/data/options_signals_history.json. Dhan has no history for these, so the
series only exists from the day this starts running; it is not used by the forecast
until there are >= 60 snapshots and it beats the baseline in a backtest.

Skips silently (exit 0) when Dhan credentials are missing.
"""

import json
import time
from datetime import datetime
from pathlib import Path

import dhan_client
from dhan_client import IST

PROJECT_ROOT = Path(__file__).parent.parent
HISTORY_PATH = PROJECT_ROOT / "dashboard" / "data" / "options_signals_history.json"


def summarise_chain(chain):
    spot = float(chain.get("last_price") or 0)
    oc = chain.get("oc") or {}
    if not spot or not oc:
        return None
    strikes = sorted(oc, key=lambda k: abs(float(k) - spot))
    atm = oc[strikes[0]]
    ivs = [float((atm.get(s) or {}).get("implied_volatility") or 0) for s in ("ce", "pe")]
    ivs = [v for v in ivs if v > 0]
    ce_oi = sum(float((v.get("ce") or {}).get("oi") or 0) for v in oc.values())
    pe_oi = sum(float((v.get("pe") or {}).get("oi") or 0) for v in oc.values())
    return {
        "spot": round(spot, 2),
        "atm_strike": float(strikes[0]),
        "atm_iv": round(sum(ivs) / len(ivs), 2) if ivs else None,
        "ce_oi": int(ce_oi),
        "pe_oi": int(pe_oi),
        "pcr_oi": round(pe_oi / ce_oi, 3) if ce_oi else None,
    }


def main():
    if not dhan_client.available():
        print("INFO: Dhan credentials not set — options signal snapshot skipped")
        return
    today = datetime.now(IST).date().isoformat()
    snap = {"date": today, "captured_at": datetime.now(IST).isoformat(timespec="seconds")}
    for ex, und in (("nse", "NIFTY"), ("bse", "SENSEX")):
        exps = dhan_client.expiry_list(und)
        time.sleep(3.5)
        if not exps:
            continue
        near = next((e for e in exps if e >= today), exps[0])
        chain = dhan_client.option_chain(und, near)
        time.sleep(3.5)
        s = summarise_chain(chain) if chain else None
        if s:
            snap[ex] = {"underlying": und, "expiry": near, **s}
    if "nse" not in snap and "bse" not in snap:
        print("WARNING: no option-chain data captured")
        return

    hist = []
    if HISTORY_PATH.exists():
        with open(HISTORY_PATH) as f:
            hist = json.load(f).get("snapshots", [])
    hist = [h for h in hist if h["date"] != today] + [snap]
    hist.sort(key=lambda h: h["date"])
    with open(HISTORY_PATH, "w") as f:
        json.dump({"updated_at": snap["captured_at"], "snapshots": hist}, f, separators=(",", ":"))
    print(f"Options signals: {len(hist)} snapshots (latest {today})")


if __name__ == "__main__":
    main()
