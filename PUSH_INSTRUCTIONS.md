# GitHub Push Instructions

## What's inside
This package mirrors the repo structure for `Research-Tusk/nse-cloud-pipeline`.
Extract and copy all files into your local clone, replacing existing files.

## Directory mapping

```
github-push-package/
├── .github/workflows/
│   └── exchange-update.yml       ← NEW: replaces nse-update.yml (runs both NSE + BSE)
├── scripts/
│   ├── nse_pipeline.py           ← UPDATED: now writes to dashboard/data/ (no inline app.js)
│   └── bse_pipeline.py           ← NEW: BSE pipeline (curl_cffi + Supabase)
├── dashboard/                    ← REPLACED: unified NSE+BSE dashboard
│   ├── index.html
│   ├── app.js                    ← fetch() from data/*.json, exchange switcher pill
│   ├── style.css
│   ├── base.css
│   └── data/
│       ├── nse_dashboard_data.json
│       ├── nse_enriched_data.json
│       ├── bse_dashboard_data.json
│       └── bse_enriched_data.json
├── data/                         ← backward compat (Supabase pipeline writes here too)
│   ├── dashboard_data.json       ← same as nse_dashboard_data.json
│   ├── enriched_data.json        ← same as nse_enriched_data.json
│   ├── bse_dashboard_data.json
│   └── bse_enriched_data.json
├── vercel.json                   ← UPDATED: added Cache-Control for /data/
├── requirements.txt              ← unchanged
└── bse_supabase_schema.sql       ← NEW: run in Supabase SQL Editor
```

## Steps

### 1. Clone and copy files
```bash
cd ~/path-to/nse-cloud-pipeline
tar -xzf github-push-package.tar.gz
cp -r github-push-package/* .
cp -r github-push-package/.github .
```

### 2. Delete old workflow
```bash
rm .github/workflows/nse-update.yml
```

### 3. Commit and push
```bash
git add -A
git commit -m "🔄 Unified NSE+BSE dashboard with dual pipeline"
git push
```

### 4. Run BSE Supabase schema
Go to your Supabase Dashboard → SQL Editor and run the contents of `bse_supabase_schema.sql`.
This creates the `bse_daily`, `bse_aggregates`, and `bse_pipeline_runs` tables.

### 5. Verify Vercel deploy
After pushing, Vercel should auto-deploy (or trigger via deploy hook).
The dashboard at https://nse-cloud-pipeline.vercel.app/ should now show the NSE/BSE exchange switcher.

## GitHub Secrets needed (already set for NSE)
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_KEY` — service_role key
- `VERCEL_DEPLOY_HOOK` — Vercel deploy webhook URL

## What changed
- **Dashboard**: Now unified with NSE/BSE exchange pill switcher. Data loaded via fetch() from JSON files instead of inline in app.js.
- **NSE pipeline**: Writes to both `data/` and `dashboard/data/nse_*.json`
- **BSE pipeline**: New script using curl_cffi to fetch from BSE (ASP.NET pages). Writes to both `data/` and `dashboard/data/bse_*.json`
- **Workflow**: `exchange-update.yml` replaces `nse-update.yml`. Runs NSE then BSE sequentially, triggers Vercel deploy if either has new data.
