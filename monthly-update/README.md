# Release scripts

| File | Role |
|---|---|
| `make_release.py` | Entry point. GRID data (all versions) → both deployment options + `manifest.json`. Can also add a new version from a PAYOUT Grid workbook. |
| `template.html` | Page design and logic (versions, filters, multi-keyword search, change labels, visitor count); the protected data is injected into it |
| `build.py` | Workbook rules (only for the PAYOUT Grid workbook route): segment classification (GVW bands, PCV, Misc-D, Private Car, Two-Wheeler), insurer-name cleanup, merging identical offers, ranking |
| `parse.py` | Reads the state sheets (`TN PO`, `KL PO`, `KA PO`, `AP-TS PO`, `MH PO`) of a PAYOUT Grid workbook |
| `corrections_Oct2026.json` | October's manual correction (kept for the record). Start a new file for a month that needs one (`--corrections`) |
| `requirements.txt` | Python dependency for the workbook route (`openpyxl`) |

Needs Python 3.9+.

```bash
# full GRID data (normal case)
python3 make_release.py grid-data.json <output_folder>

# new version from a PAYOUT Grid workbook, added on top of the live release
python3 make_release.py <PAYOUT.xlsx> <output_folder> --prev <live data/grid-data.json> \
    --month "December 2026" --start 2026-12-01 --end 2026-12-31 [--note "..."] [--corrections file.json]
```

`grid-data.json` may be plain JSON (`{"versions": [...]}`) or the protected file from a previous release — the script reads both and always writes the protected form.

## Data shape

```json
{"versions": [{"id": "2026-11-v1", "name": "Smart Grid November 2026 - Version 1",
  "label": "Smart Grid November 2026 - Version 1 - 03-11-2026 to 30-11-2026",
  "dates": "03-11-2026 to 30-11-2026", "month": "November 2026", "version": "1",
  "start": "2026-11-03", "end": "2026-11-30", "period": "03 – 30 November 2026", "note": "",
  "data": {"states": [...], "order": [...], "records": [...]}}]}
```

Each record: `state, sec, title, company, segment, package, tp, remarks, rank, single`, and for changed rates
`chg` (up / down / mixed / new), `dup` / `ddn` (amounts), `was` (earlier rate), `basis` (version compared with).
Remarks read `Age: … | Discount: … | Remark: … | RTO: …`; several conditions are joined as `(…) OR (…)`.

## Key rules
- Payables only — receivable commission must never be in the data or remarks.
- Rank inside each state + segment: Package high → low (TP when Package is NA).
- Change labels compare each month's Version 1 with the previous month's last version; later versions in a month keep the labels counted from Version 1.
- In remarks, doable / only makes come first and declined makes last.
- Zero-payout lines are left out.
