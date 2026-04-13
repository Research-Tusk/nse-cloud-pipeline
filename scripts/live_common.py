"""
Shared hourly snapshot + prediction logic for NSE and BSE live pollers.

Prediction methodology:
  - Linear fallback: predicted = revenue_so_far × (375 / elapsed_min)
  - Historical (preferred, requires ≥3 days): for each hour label, compute
    the average fraction of EOD revenue earned by that point across all
    historical days. Then: predicted = revenue_so_far / avg_fraction.

Historical file format ({exchange}_hourly_history.json):
  {
    "exchange": "nse",
    "days": [
      {
        "date": "2026-04-13",
        "eod_revenue": 74.08,
        "snapshots": [
          {"hour_label": "10:00", "total_revenue": 25.3, "fraction": 0.341},
          ...
          {"hour_label": "15:30", "total_revenue": 74.08, "fraction": 1.0}
        ]
      }
    ]
  }
"""

import json
from pathlib import Path

MARKET_OPEN_MIN  = 9 * 60 + 15   # 9:15 AM IST
MARKET_TOTAL_MIN = 375            # 9:15 → 15:30
MIN_HISTORY_DAYS = 3              # fall back to linear below this


def hourly_label(now_ist):
    """Return snapshot label if this run is in a capture window, else None."""
    h, m = now_ist.hour, now_ist.minute
    if h == 15 and 28 <= m <= 35:
        return "15:30"
    if h in (10, 11, 12, 13, 14, 15) and m < 5:
        return f"{h:02d}:00"
    return None


def elapsed_for_label(label):
    h, m = map(int, label.split(":"))
    return h * 60 + m - MARKET_OPEN_MIN


def _load_history(history_file: Path):
    if history_file.exists():
        try:
            return json.loads(history_file.read_text())
        except Exception:
            pass
    return {"days": []}


def _historical_fractions(history_file: Path):
    """
    Returns dict: {hour_label -> avg_fraction} across all historical days
    that have a 15:30 (EOD) entry. Returns {} if insufficient data.
    """
    data = _load_history(history_file)
    days = [d for d in data.get("days", []) if d.get("eod_revenue", 0) > 0]
    if len(days) < MIN_HISTORY_DAYS:
        return {}

    from collections import defaultdict
    label_fractions = defaultdict(list)
    for day in days:
        eod = day["eod_revenue"]
        for snap in day.get("snapshots", []):
            frac = snap.get("fraction")
            if frac is not None and snap.get("hour_label"):
                label_fractions[snap["hour_label"]].append(frac)

    return {
        label: round(sum(fracs) / len(fracs), 4)
        for label, fracs in label_fractions.items()
        if fracs
    }


def predict_eod(revenue_so_far, label, history_file: Path):
    """
    Predict EOD revenue.
    Uses historical avg fractions when ≥3 days available, else linear.
    Returns (predicted_value, method_string).
    """
    if not revenue_so_far or revenue_so_far <= 0:
        return None, "none"

    elapsed = elapsed_for_label(label)
    if elapsed <= 0:
        return None, "none"

    fractions = _historical_fractions(history_file)
    avg_frac  = fractions.get(label)

    if avg_frac and avg_frac > 0:
        predicted = round(revenue_so_far / avg_frac, 2)
        return predicted, "historical"
    else:
        # Linear: assume constant rate through the day
        predicted = round(revenue_so_far * MARKET_TOTAL_MIN / elapsed, 2)
        return predicted, "linear"


def archive_day_to_history(hourly_file: Path, history_file: Path):
    """
    Called at 15:30. If today's hourly file has a 15:30 entry, append it
    to the history file (idempotent — won't re-add same date).
    """
    if not hourly_file.exists():
        return

    try:
        today_data = json.loads(hourly_file.read_text())
    except Exception:
        return

    today_date = today_data.get("date")
    snaps      = today_data.get("snapshots", [])

    # Need the 15:30 snap to know EOD revenue
    eod_snap = next((s for s in snaps if s.get("hour_label") == "15:30"), None)
    if not eod_snap or not eod_snap.get("has_data"):
        return

    eod_rev = eod_snap.get("total_revenue") or 0
    if eod_rev <= 0:
        return

    # Compute fractions relative to EOD
    snaps_with_fractions = []
    for s in snaps:
        rev = s.get("total_revenue") or 0
        snaps_with_fractions.append({
            "hour_label":    s["hour_label"],
            "total_revenue": rev,
            "fraction":      round(rev / eod_rev, 4) if eod_rev else None,
        })

    history = _load_history(history_file)
    days    = history.get("days", [])

    # Idempotent: skip if date already archived
    if any(d.get("date") == today_date for d in days):
        print(f"  History: {today_date} already archived — skipping")
        return

    days.append({
        "date":        today_date,
        "eod_revenue": eod_rev,
        "snapshots":   snaps_with_fractions,
    })
    # Keep last 60 trading days
    history["days"] = sorted(days, key=lambda d: d["date"])[-60:]

    history_file.parent.mkdir(parents=True, exist_ok=True)
    history_file.write_text(json.dumps(history, indent=2))
    n = len(history["days"])
    print(f"  History: archived {today_date} (EOD ₹{eod_rev} Cr) — {n} days in history")


def save_hourly_snapshot(revenue, now_ist, hourly_file: Path, history_file: Path):
    """
    Save the current hour's snapshot to hourly_file.
    At 15:30, also archives the day to history_file.
    """
    label = hourly_label(now_ist)
    if label is None:
        return

    today_str = now_ist.strftime("%Y-%m-%d")

    existing = {}
    if hourly_file.exists():
        try:
            existing = json.loads(hourly_file.read_text())
        except Exception:
            existing = {}

    if existing.get("date") != today_str:
        existing = {"date": today_str, "snapshots": []}

    snaps = existing.get("snapshots", [])
    if any(s["hour_label"] == label for s in snaps):
        print(f"  Hourly snapshot {label} already recorded — skipping")
        # Still try to archive at 15:30 (in case previous run failed)
        if label == "15:30":
            archive_day_to_history(hourly_file, history_file)
        return

    total_rev = round(float(revenue.get("total_revenue") or 0), 2) if revenue else None
    pred, method = predict_eod(total_rev, label, history_file)

    snap = {
        "hour_label":      label,
        "captured_ist":    now_ist.strftime("%Y-%m-%dT%H:%M:%S"),
        "elapsed_minutes": elapsed_for_label(label),
        "total_revenue":   total_rev,
        "cash_revenue":    round(float(revenue.get("cash_revenue")    or 0), 2) if revenue else None,
        "options_revenue": round(float(revenue.get("options_revenue")  or 0), 2) if revenue else None,
        "futures_revenue": round(float(revenue.get("futures_revenue")  or 0), 2) if revenue else None,
        "has_data":        bool(revenue and revenue.get("has_data")),
        "predicted_eod":   pred,
        "pred_method":     method,
    }
    snaps.append(snap)
    snaps.sort(key=lambda x: x["hour_label"])
    existing["snapshots"] = snaps

    hourly_file.parent.mkdir(parents=True, exist_ok=True)
    hourly_file.write_text(json.dumps(existing, indent=2))
    print(f"  Hourly snapshot {label} — ₹{total_rev} Cr, pred EOD ₹{pred} Cr [{method}]")

    # At end of day, archive to history
    if label == "15:30":
        archive_day_to_history(hourly_file, history_file)
