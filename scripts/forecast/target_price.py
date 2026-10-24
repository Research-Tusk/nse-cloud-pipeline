"""
Price ~ Rev_MA45 model diagnostics for the scenario manager.

Reads the existing dashboard/data/{ex}_share_analysis.json (fit unchanged:
Price = slope × Rev_MA45 + intercept from regression_start) and adds what is needed
to turn an assumed 45-DMA into a target price with honest uncertainty:

  * HAC (Newey–West) slope/intercept standard errors — residuals are strongly
    autocorrelated so iid OLS errors overstate precision
  * Engle–Granger cointegration test (price, Rev_MA45): guards against a spurious
    regression between two trending series
  * empirical residual quantiles (₹ and %) for prediction bands
  * AR(1) of residuals → mispricing half-life (how fast price reverts to the line)
  * rolling 120-day slope (stability)
  * Price / Rev_MA ratio mean and σ over the regression window and the last year
"""

import json
import math

import numpy as np
import pandas as pd

from .common import DATA_DIR

ROLL_WIN = 120


def price_model(ex):
    path = DATA_DIR / f"{ex}_share_analysis.json"
    if not path.exists():
        return None
    sa = json.load(open(path))
    reg = sa.get("regression")
    if not reg:
        return {"status": sa.get("status", "unavailable"), "n_days": sa.get("n_days"),
                "min_days_required": sa.get("min_days_required"), "latest": sa.get("latest")}

    ser = pd.DataFrame(sa["series"])
    ser = ser[ser["price"].notna() & ser["rev_ma"].notna()]
    ser["date"] = pd.to_datetime(ser["date"])
    fit = ser[ser["date"] >= sa["regression_start"]].reset_index(drop=True)
    x, y = fit["rev_ma"].values.astype(float), fit["price"].values.astype(float)
    slope, intercept = float(reg["slope"]), float(reg["intercept"])
    resid = y - (slope * x + intercept)
    resid_pct = resid / (slope * x + intercept)

    out = {
        "status": "ok", "ticker": sa.get("ticker"), "regression_start": sa["regression_start"],
        "n": int(len(fit)), "slope": slope, "intercept": intercept,
        "r_squared": reg.get("r_squared"), "latest": sa.get("latest"),
        "resid_q": {f"p{q}": round(float(np.quantile(resid, q / 100)), 2)
                    for q in (2.5, 5, 10, 25, 50, 75, 90, 95, 97.5)},
        "resid_pct_q": {f"p{q}": round(float(np.quantile(resid_pct, q / 100)), 4)
                        for q in (2.5, 5, 10, 25, 50, 75, 90, 95, 97.5)},
        "resid_sd": round(float(resid.std(ddof=2)), 2),
    }

    # AR(1) on residuals → half-life of deviation from the line
    if len(resid) > 30:
        rho = float(np.corrcoef(resid[:-1], resid[1:])[0, 1])
        out["resid_ar1"] = round(rho, 4)
        out["mispricing_halflife_days"] = (round(-math.log(2) / math.log(rho), 1)
                                           if 0 < rho < 1 else None)

    try:
        import statsmodels.api as sm
        from statsmodels.tsa.stattools import coint
        X = sm.add_constant(x)
        ols = sm.OLS(y, X).fit()
        hac = sm.OLS(y, X).fit(cov_type="HAC", cov_kwds={"maxlags": 20})
        out["se_ols"] = {"intercept": round(float(ols.bse[0]), 3), "slope": round(float(ols.bse[1]), 3)}
        out["se_hac"] = {"intercept": round(float(hac.bse[0]), 3), "slope": round(float(hac.bse[1]), 3)}
        t_stat, p_val, _ = coint(y, x)
        out["engle_granger"] = {"t": round(float(t_stat), 3), "p": round(float(p_val), 4),
                                "cointegrated_5pct": bool(p_val < 0.05)}
    except Exception as e:  # statsmodels missing or numerical issue
        out["stats_error"] = str(e)[:200]

    if len(fit) > ROLL_WIN + 20:
        roll = []
        for i in range(ROLL_WIN, len(fit) + 1, 5):
            xs, ys = x[i - ROLL_WIN:i], y[i - ROLL_WIN:i]
            b = np.polyfit(xs, ys, 1)
            roll.append({"date": str(fit["date"].iloc[i - 1].date()),
                         "slope": round(float(b[0]), 2), "intercept": round(float(b[1]), 1)})
        out["rolling_slope"] = roll

    ratio = (ser["price"] / ser["rev_ma"]).astype(float)
    def stats(mask):
        r = ratio[mask]
        return {"mean": round(float(r.mean()), 3), "sd": round(float(r.std(ddof=0)), 3),
                "n": int(mask.sum())} if mask.sum() > 20 else None
    last = ser["date"].max()
    out["ratio"] = {
        "regression_window": stats(ser["date"] >= sa["regression_start"]),
        "last_1y": stats(ser["date"] >= last - pd.Timedelta(days=365)),
        "current": round(float(ratio.iloc[-1]), 3),
    }
    return out
