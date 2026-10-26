# Monthly update scripts

| File | Role |
|---|---|
| `make_site.py` | **Entry point.** Reads `versions.json`, works out each version's dates, builds the GRID page with every version in its version bar (`smart-grid/` and `single-file/`) + `manifest.json` |
| `versions.json` | One entry per GRID version: id, month, version, start, end, workbook, optional `supplements` (extra rows), corrections, what changed |
| `compare.py` | Increased / Decreased / New labels: pairs each changed rate with its earlier rate |
| `build.py` | Business rules: segment classification (GVW bands, PCV, Misc-D, Private Car, Two-Wheeler), insurer-name cleanup, merging identical offers, ranking |
| `parse.py` | Reads the state sheets (`TN PO`, `KL PO`, `KA PO`, `AP-TS PO`, `MH PO`) and finds the CV / Private Car / Two-Wheeler blocks by their header rows |
| `template.html` | Page design and logic (filters, version bar, search with keys — age / cc / fuel / make / rto / gvw / seats — and GVW lookup); the data is injected into it |
| `corrections_Oct2026_v1.json` | Manual rate/remark corrections for October Version 1, applied on top of the workbook |
| `corrections_Oct2026_v3.json` | October Version 3: the Version 2 corrections plus 48 United India rows from the circular of 23.10.2026 (Taxi, Goods 7501–10000 / 20001–25000, Private Car CC bands and SAOD; "Except OEMs and Diesel" 35% rows dropped) |
| `corrections_Oct2026_v2.json` | October Version 2: the Version 1 corrections plus TATA AIG TN School Bus (61% above 12 seats, all TN RTOs; the two older TATA TN school-bus rows dropped) |
| `requirements.txt` | Python dependency (`openpyxl`) |

Needs Python 3.9+.

```bash
pip install -r requirements.txt
python3 make_site.py ..        # from monthly-update/, or: python3 monthly-update/make_site.py .  from the kit folder
```

**Dates:** each version runs from its `start` to the day before the next version's `start` (or its own `end` if it is the last). Example: adding a Version 2 that starts on 20-10-2026 would make Version 1 end on 19-10-2026 automatically. Link names follow `Smart Grid <Month YYYY> - Version <n> - <dd-mm-yyyy> to <dd-mm-yyyy>`.

**A new version of the same month** usually means: copy the previous corrections file to `..._v<n>.json`, add the new change to it, and add the version to `versions.json` with the date it takes effect.

## Supplement workbooks (extra rows)

When an insurer's rates are sent separately (e.g. `RSA_Missing_GRID_-_Oct_26.xlsx`), put the file in `source/` and list it in that version's `supplements` in `versions.json`. It needs one header row with the usual columns (Vehicle Category, Company, Age, Discount, Package, TP, Remark, RTO) plus **State** (Tamil Nadu / Kerala / Karnataka / Andhra Pradesh / Telangana / Maharashtra); the column before Vehicle Category says *Pvt Car*, *TW* or *CV*. Its rows are ranked together with the main workbook.

**An insurer's complete new GRID** (e.g. `GRID_Oct_V2_Changes_-_Effective_22-10-2026.xlsx` for National): list it as an object with `replaces` — every row of that insurer in the states the file covers is removed from the workbook first, so the file becomes that insurer's whole GRID there:

```json
"supplements": ["source/RSA_Missing_GRID_-_Oct_26.xlsx",
                {"file": "source/GRID_Oct_V2_Changes_-_Effective_22-10-2026.xlsx", "replaces": ["National"]}]
```

To replace only one product of an insurer (e.g. Kshema Kerala Two-Wheeler, keeping its commercial-vehicle rates): `"replaces": [{"company": "Kshema", "block": "TW"}]` (block `CV`, `PC` or `TW`). `remark_add` skips rows whose remark already contains the text.

The product column may also say *GCCV*, *PCCV* or *MISC-D*. *Long Term Package* (3+3 / 5+5) goes to the Bundle section like 1+3 / 1+5; *E-rickshaw* and *E-cart* rows under MISC-D go to PCV – Auto and LCV – Auto GCV & E-Kart. Supplement remarks get small clean-ups (`( KTM Decline) ( KTM Decline)` → `(KTM Decline)`, `Yemaha` → `Yamaha`).

**Remark wording not in the sheet** (`remark_add` in a version of `versions.json`, optional — not used at present): text added at the end of the Remark of every matching row:

```json
"remark_add": [{"company": "<insurer>", "state": "KL", "block": "TW", "text": "<wording>"}]
```
`block` is `CV`, `PC` (Private Car) or `TW`; leave it out for all. Prefer putting the wording in the sheet itself — e.g. Kshema's CPA / TPPD remark belongs to Bundle policies only and comes from the sheet.

## Key rules (from build.py)

- **Goods vehicles** go into every GVW band their range overlaps: Upto 2000 · 2001–3500 · 3501–7500 · 7501–12000 · 12001–20000 · 20001–40000 · Above 40000. Example: "Upto 2500" → LCV Upto 2000 and LCV 2001–3500.
- 3W / Auto GCV / E-cart → LCV Auto GCV & E-Kart; Flat Bed → HCV Flat Bed; Tractor → Misc-D Agricultural Tractor; other Misc-D (harvester, excavator, crane, ambulance, garbage…) → Misc-D Other.
- **PCV:** Auto / 3W / E-rickshaw → PCV Auto; 6+1, 4+1, upto 6 → Taxi Upto 6-Seater; 7+ seats / bus → Taxi & Stage Bus; un-banded "Taxi" → both; School Bus / Staff Bus.
- **Private Car / Two-Wheeler:** Bundle (1+3 / 1+5), Package (1+1), SAOD (OD), SATP (TP). A TP-column value also creates an SATP entry.
- Rows that are identical apart from RTO/remarks are merged into one entry with "(…) OR (…)" conditions.
- Rank inside each state + segment: Package value high → low (first number of "x(OD)+y(TP)"); TP when Package is NA.

If an insurer introduces a new category wording, check the printed counts and the page; adjust the keyword lists in `build.py` (`classify_cv`, `classify_single`) if needed.
- **Shriram remark wording** (`shriram_remark` in `build.py`): only where the full "Hazardous category - Chemical Category, … Flammable liquids Category" text is found (plus any "Except/Expect New Mahindra and/-" in front of it), it is replaced with "Declined New Mahindra. Doable Hazardous category - <list>". Other remarks are untouched.

## Increased / Decreased labels (`compare.py`)

`make_site.py` labels each changed rate **▲ Increased** (green), **▼ Decreased** (red) or **New**:
- first version of a month — a rate a correction changed is compared with the workbook value it replaced; rates from supplement workbooks are New;
- a later version of the same month — every rate that is new or different from the month's **first** version is paired with the rate there (so Version 3 keeps the Version 2 labels) (same state, segment and insurer; same vehicle-type keywords; restricted-RTO with restricted-RTO; overlapping weight band, seats and vehicle age — closest overlap wins) and compared part by part (OD with OD, TP with TP; a flat rate counts for both). Package decides; TP when Package is NA or unchanged. No earlier rate → New; same value → no label.

Each label also shows the change: `+3.00` (same change on both parts, or a one-part section like SAOD / SATP), `−5.00(OD)`, `+5.00(OD) +10.00(TP)`, `TP +5.00` (TP column) or a range such as `+15.00 to +20.00` when one rate replaces several earlier rates.

`manifest.json` shows the counts per version (`ratesLabelled`). The page shows the earlier rate when a label is hovered.

## Manual corrections (`--corrections`)

When the business revises a rate after the workbook is issued, add an entry to a corrections JSON file instead of editing the Excel:

```json
{"sheet": "TN PO", "row": 885, "note": "why / who / when",
 "expect": {"company": "New India", "cat": "SCHOOL BUS", "pkg": 56, "tp": 56, "rto": "ALL RTO"},
 "set":    {"pkg": 66, "tp": 66, "rto": "Policy Issuance allowed only in ..."}}
```

A rate the business has withdrawn: `{"sheet", "row", "expect": {...}, "drop": true, "note"}` removes that row (October Version 2 drops two TATA AIG TN school-bus rows this way).

Fields: `cat`, `company`, `age`, `disc`, `pkg`, `tp`, `remark`, `rto`, plus `offer` — `{"title": "POSP Special Offer!", "text": "Hit ₹5L volume …"}` — which the page shows as a highlighted offer badge under that rate. The build stops with a message if that row no longer holds the `expect` values, so a correction never lands on the wrong row. Corrections are version-specific: each version in `versions.json` names its own file. Start a new file (or none) for the next month's workbook.

