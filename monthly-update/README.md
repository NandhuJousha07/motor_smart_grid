# Monthly update scripts

| File | Role |
|---|---|
| `make_release.py` | Entry point. Excel → both deployment options + `manifest.json` |
| `build.py` | Business rules: segment classification (GVW bands, PCV, Misc-D, Private Car, Two-Wheeler), insurer-name cleanup, merging identical offers, ranking |
| `parse.py` | Reads the state sheets (`TN PO`, `KL PO`, `KA PO`, `AP-TS PO`, `MH PO`) and finds the CV / Private Car / Two-Wheeler blocks by their header rows |
| `template.html` | Page design and logic; the data is injected into it |
| `corrections_Oct2026.json` | Manual rate/remark corrections for October, applied on top of the workbook (`--corrections`) |
| `requirements.txt` | Python dependency (`openpyxl`) |

Needs Python 3.9+.

```bash
pip install -r requirements.txt
python3 make_release.py <PAYOUT.xlsx> <output_folder> --period "01 – 30 November 2026" --month "November 2026" --version 1.0 [--note "..."]
```

## Key rules (from build.py)

- **Goods vehicles** go into every GVW band their range overlaps: Upto 2000 · 2001–3500 · 3501–7500 · 7501–12000 · 12001–20000 · 20001–40000 · Above 40000. Example: "Upto 2500" → LCV Upto 2000 and LCV 2001–3500.
- 3W / Auto GCV / E-cart → LCV Auto GCV & E-Kart; Flat Bed → HCV Flat Bed; Tractor → Misc-D Agricultural Tractor; other Misc-D (harvester, excavator, crane, ambulance, garbage…) → Misc-D Other.
- **PCV:** Auto / 3W / E-rickshaw → PCV Auto; 6+1, 4+1, upto 6 → Taxi Upto 6-Seater; 7+ seats / bus → Taxi & Stage Bus; un-banded "Taxi" → both; School Bus / Staff Bus.
- **Private Car / Two-Wheeler:** Bundle (1+3 / 1+5), Package (1+1), SAOD (OD), SATP (TP). A TP-column value also creates an SATP entry.
- Rows that are identical apart from RTO/remarks are merged into one entry with "(…) OR (…)" conditions.
- Rank inside each state + segment: Package value high → low (first number of "x(OD)+y(TP)"); TP when Package is NA.

If an insurer introduces a new category wording, check the printed counts and the page; adjust the keyword lists in `build.py` (`classify_cv`, `classify_single`) if needed.
- **Shriram remark wording** (`shriram_remark` in `build.py`): only where the full "Hazardous category - Chemical Category, … Flammable liquids Category" text is found (plus any "Except/Expect New Mahindra and/-" in front of it), it is replaced with "Declined New Mahindra. Doable Hazardous category - <list>". Other remarks are untouched.

## Manual corrections (`--corrections`)

When the business revises a rate after the workbook is issued, add an entry to a corrections JSON file instead of editing the Excel:

```json
{"sheet": "TN PO", "row": 885, "note": "why / who / when",
 "expect": {"company": "New India", "cat": "SCHOOL BUS", "pkg": 56, "tp": 56, "rto": "ALL RTO"},
 "set":    {"pkg": 66, "tp": 66, "rto": "Policy Issuance allowed only in ..."}}
```

Fields: `cat`, `company`, `age`, `disc`, `pkg`, `tp`, `remark`, `rto`, plus `offer` — `{"title": "POSP Special Offer!", "text": "Hit ₹5L volume …"}` — which the page shows as a highlighted offer badge under that rate. The build stops with a message if that row no longer holds the `expect` values, so a correction never lands on the wrong row. Corrections are month-specific: start a new file (or none) for the next month's workbook.

