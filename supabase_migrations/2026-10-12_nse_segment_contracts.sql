-- Per-segment F&O contract counts for nse_daily.
-- Source: NSE /api/historicalOR/fo/tbg/daily fields Index_Futures_QTY,
-- Stock_Futures_QTY, Index_Options_QTY, Stock_Options_QTY (sum = F&O_Total_QTY).
-- Apply in Supabase SQL editor, then run: python scripts/nse_backfill_contracts.py
ALTER TABLE nse_daily
    ADD COLUMN IF NOT EXISTS if_contracts BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS sf_contracts BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS io_contracts BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS so_contracts BIGINT DEFAULT 0;
