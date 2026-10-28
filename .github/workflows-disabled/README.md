# Disabled at cutover (28 Oct 2026)

These workflows wrote the NSE/BSE Supabase tables, the OneDrive Excel workbook
and the live JSON. That job moved to sucaanalytics-max/ExchangesDash after a
clean parallel run (19–27 Oct 2026), and two writers to the same tables must
not run at once, so they were moved out of `.github/workflows/`: GitHub runs
nothing from this folder, on schedule or on dispatch.

To re-enable (rollback), first set `ENABLE_SUPABASE_WRITES=false` (and
`ENABLE_EXCEL_SYNC=false`) on ExchangesDash, then move the files back:

    git mv .github/workflows-disabled/*.yml .github/workflows/
