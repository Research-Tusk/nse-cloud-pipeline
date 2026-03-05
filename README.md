# NSE Analytics — Cloud Pipeline

Automated daily NSE trading data pipeline with a live analytics dashboard.

**Stack:** GitHub Actions (cron) → curl_cffi (NSE fetch) → Supabase (PostgreSQL) → Vercel (static dashboard)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions  (cron: 6:00 AM IST, Mon-Fri)              │
│                                                             │
│  1. curl_cffi fetches NSE F&O + Cash APIs                   │
│  2. Parses records, computes revenue via take rates          │
│  3. Upserts new daily rows → Supabase PostgreSQL             │
│  4. Recomputes all aggregates (quarterly, monthly, weekly)   │
│  5. Writes dashboard_data.json + enriched_data.json          │
│  6. Updates inline DATA in app.js                            │
│  7. Git commits + pushes                                     │
│         │                                                    │
│         └──→ Vercel auto-deploys on push                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup Guide

### Prerequisites

- GitHub account (free)
- Supabase account (free tier: 500MB, 2 projects)
- Vercel account (free tier)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name: `nse-analytics` (or anything you prefer)
3. Set a strong database password
4. Region: **Mumbai (ap-south-1)** for lowest latency
5. Wait for project to finish provisioning (~2 minutes)

### Step 2: Run Database Schema

1. In Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Paste the entire contents of `supabase_schema.sql`
4. Click **Run**
5. Verify in **Table Editor** that you see: `nse_daily`, `nse_pnl`, `nse_pnl_fy`, `nse_cost_ratios`, `nse_aggregates`, `nse_pipeline_runs`

### Step 3: Get Supabase Credentials

1. Supabase Dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **service_role key** (under "Project API keys" — the SECRET one, not anon)

### Step 4: Seed Historical Data

On your local Mac:

```bash
# Clone the repo (after Step 5)
git clone https://github.com/Research-Tusk/nse-analytics.git
cd nse-analytics

# Install Python deps
pip3 install -r requirements.txt

# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-service-role-key"

# Run seed script (uploads 724 daily records + P&L + cost ratios)
python3 scripts/seed_supabase.py
```

### Step 5: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name: `nse-analytics` (private recommended)
3. Push the project:

```bash
cd nse-cloud-pipeline
git init
git add .
git commit -m "Initial commit: NSE Analytics Pipeline"
git remote add origin https://github.com/Research-Tusk/nse-analytics.git
git branch -M main
git push -u origin main
```

### Step 6: Add GitHub Secrets

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:
   - `SUPABASE_URL` → your Supabase project URL
   - `SUPABASE_KEY` → your Supabase service_role key

### Step 7: Connect Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your `nse-analytics` GitHub repo
3. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (the repo root)
   - **Output Directory:** `dashboard`
   - **Build Command:** leave empty (static files, no build needed)
4. Click **Deploy**

Vercel will serve `dashboard/index.html` as the entry point. Every time GitHub Actions pushes updated data, Vercel auto-redeploys.

### Step 8: Test the Pipeline

1. GitHub repo → **Actions** tab → **NSE Daily Update**
2. Click **Run workflow** → **Run workflow**
3. Watch the logs — you should see:
   - NSE data fetched
   - Records upserted to Supabase
   - `dashboard_data.json` committed
   - Vercel deploys automatically

---

## Project Structure

```
nse-cloud-pipeline/
├── .github/
│   └── workflows/
│       └── nse-update.yml       # GitHub Actions cron (6 AM IST, Mon-Fri)
├── scripts/
│   ├── nse_pipeline.py          # Main pipeline: fetch → parse → Supabase → JSON → app.js
│   └── seed_supabase.py         # One-time: seed DB with historical data
├── dashboard/
│   ├── index.html               # Dashboard UI (6 tabs)
│   ├── app.js                   # All logic + inline DATA (auto-updated by pipeline)
│   ├── style.css                # Dark/light theme styles
│   └── base.css                 # CSS reset
├── data/
│   ├── dashboard_data.json      # Full dataset (committed to git, read by app.js)
│   └── enriched_data.json       # Pre-computed summaries
├── supabase_schema.sql          # Database schema (run once in SQL Editor)
├── vercel.json                  # Vercel deployment config
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variable template
└── .gitignore
```

---

## How the Pipeline Works

### Daily Flow (6:00 AM IST, Mon-Fri)

1. **Fetch**: `curl_cffi` impersonates Chrome to hit NSE APIs (F&O + Cash)
2. **Parse**: Computes revenue from raw turnover/premium using take rates:
   - Futures: `3.46e-05 × turnover`
   - Options: `7.006e-04 × premium`
   - Cash: `5.94e-05 × traded value`
3. **Store**: Upserts new daily rows into Supabase `nse_daily` table
4. **Aggregate**: Recomputes quarterly, monthly, weekly, day-of-week, and enriched segment summaries
5. **Write**: Updates `data/dashboard_data.json` and injects DATA into `dashboard/app.js`
6. **Commit**: Git pushes the updated files
7. **Deploy**: Vercel detects the push and auto-deploys the dashboard

### Data Tables

| Table | Rows | Purpose |
|---|---|---|
| `nse_daily` | ~724+ | Daily trading data (source of truth) |
| `nse_pnl` | ~14 | Quarterly P&L (actual + predicted) |
| `nse_pnl_fy` | ~3 | Full-year P&L |
| `nse_cost_ratios` | ~10 | Cost structure by quarter |
| `nse_aggregates` | ~6 | Pre-computed JSON blobs |
| `nse_pipeline_runs` | growing | Audit log of every pipeline run |

---

## Manual Trigger

To run the pipeline outside the schedule:

1. GitHub → Actions → NSE Daily Update → **Run workflow**
2. Or locally:
```bash
export SUPABASE_URL="..." SUPABASE_KEY="..."
python3 scripts/nse_pipeline.py
```

---

## Monitoring

- **GitHub Actions**: Check the Actions tab for run logs and failure alerts
- **Supabase Dashboard**: Table Editor → `nse_pipeline_runs` for audit trail
- **Vercel Dashboard**: Deployment history and build logs

### GitHub Notifications

GitHub sends email alerts on workflow failures by default. To add Slack/Discord notifications, add a step to the workflow:

```yaml
- name: Notify on failure
  if: failure()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    payload: '{"text": "NSE Pipeline failed! Check: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"}'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Costs

| Service | Free Tier | This Project Uses |
|---|---|---|
| GitHub Actions | 2,000 min/month | ~5 min/day × 22 days = 110 min |
| Supabase | 500MB storage, 2 projects | ~5MB (724 rows + aggregates) |
| Vercel | 100 deploys/day, 100GB bandwidth | 1 deploy/day, ~200KB |

**Total monthly cost: $0**

---

## Extending

### Add New Data Sources
Edit `scripts/nse_pipeline.py` → `fetch_nse_data()` to add VIX, additional months, etc.

### Change Dashboard Layout
Edit `dashboard/index.html` and `dashboard/style.css`. Redeploy by pushing to main.

### Query Data Programmatically
Use Supabase client or REST API:
```python
from supabase import create_client
sb = create_client(URL, KEY)
result = sb.table("nse_daily").select("*").gte("date", "2026-01-01").execute()
```

### Add Email Alerts
Use Supabase Edge Functions or add a notification step in the GitHub Actions workflow.
