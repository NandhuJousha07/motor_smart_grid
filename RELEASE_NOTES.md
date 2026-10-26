# Release Notes — Motor Smart GRID

## Release 3 — 25 Oct 2026 (October 2026 Version 3, from 26-10-2026)

**To deploy:** replace `index.html`, `assets/` and `data/` in `/smart-grid/` (or upload the new `single-file/motor-smart-grid.html`). `data/2026-10-v3.json` is new; `2026-10-v2.json` changes (Version 2 now ends 25-10-2026). Keep `counter-data/`. All file names are unchanged.

### October 2026 — Version 3 (26-10-2026 to 31-10-2026)
Version 2 plus the **United India** revised commission — circular HO:MKTG:CIR:12:26-27 dated 23.10.2026, Motor w.e.f. 26.10.2026 (copy in `source/`). 3,726 rates (TN 939 · KL 576 · KA 868 · AP-TS 1,343). Corrections: `monthly-update/corrections_Oct2026_v3.json` (42 United India rows). New payouts keep the existing deduction from United India's commission; at a 35% commission every Private Car policy type (Bundle, Package, SATP) pays 30.00 (corrected 26 Oct 2026 — Package / SATP had been set to 25.00).

| Segment | State | United India commission | GRID payout |
|---|---|---|---|
| Taxi (up to 6 seats, all CC incl. Electric) | TN, KA | 15% → 10% | 11.00 → **6.00** |
| Taxi (up to 6 seats) | KL, AP-TS | 25% → 35% | 21.00 / TP 26.00 → **31.00 / 31.00** |
| Goods 7,501–10,000 kg | KL, KA, AP-TS | 22.5% → 27.5% | 18.50 → **23.50** |
| Goods 20,001–25,000 kg | AP-TS | 15% → 25% | 11.00 → **21.00** |
| Private Car up to 1000 CC | all | 20% → 17.5% | 15.00 → **12.50** |
| Private Car 1001–1200 CC | TN, KA | 20% → 17.5% | 15.00 → **12.50** |
| Private Car 1001–1200 CC | KL, AP-TS | 40% → 35% | Bundle 35.00 → **30.00**; Package / SATP **30.00** (unchanged) |
| Private Car 1201–1500 CC | all | 20% → 15% | 15.00 → **10.00** |
| Private Car 1501–2000 CC | all | 40% → 35% | Bundle 35.00 → **30.00**; Package / SATP **30.00** (unchanged) |
| Private Car SAOD (Except Electric) | all | 15% → 25% | 10.00(OD) → **20.00(OD)** |
| Private Car "Except OEMs and Diesel upto 1500CC" (listed RTOs) | all | — | 35.00 **not continued** (kept in Versions 1 and 2) |

Unchanged: Private Car above 2000 CC and Electric, Two-Wheeler, other PCV, 3-wheeler, School / Staff Bus, other goods bands, Misc-D. **Pending:** TN Goods 2,001–3,500 — RTOs in United India's Sub Annexure 2 get 56.5% (list not yet received).

**Labels in Version 3:** compared with Version 1 (the month's first version), so the Version 2 changes (National, TATA AIG, Kshema) keep their Increased / Decreased labels and the United India changes are added — e.g. United India TN Taxi ▼ −5.00, KL Taxi ▲ +10.00, Private Car upto 1000CC ▼ −2.50, SAOD ▲ +10.00. Version 2 keeps its own labels exactly as before. Comparison now also matches Private Car CC bands and Electric only / Except Electric.

## Release 2 — 22 Oct 2026 (October 2026 Version 2)

**To deploy:** replace `index.html`, `assets/` and `data/` in `/smart-grid/` with the ones from this kit (or upload the new `single-file/motor-smart-grid.html`). Keep `counter-data/` — it holds the visitor totals. `visitor-counter.php` is unchanged. All file and folder names are the same as Release 1; `data/2026-10-v2.json` is new and `data/2026-10-v1.json` is updated (labels and the earlier Kshema Kerala Two-Wheeler rates) — replace both.

### October 2026 — Version 2 (22-10-2026 to 31-10-2026)
Source: `From_6th_To_31st_Oct_PAYOUT_Grid_2026.xlsx` + `RSA_Missing_GRID_-_Oct_26.xlsx` + `GRID_Oct_V2_Changes_-_Effective_22-10-2026.xlsx` + `EG_GRID_Kshema_Kerala.xlsx` — 3,736 rates (TN 943 · KL 577 · KA 872 · AP-TS 1,344). Corrections: `monthly-update/corrections_Oct2026_v2.json`.

- **TATA AIG, TN, PCV – School Bus:** **61.00 / 61.00** for above 12 seats, **all TN RTOs**. Replaces the earlier TN rates 58.00 (Chennai & Coimbatore), 56.00 (above 31 seats, ROTN) and 53.00 (16 to 30 seats, ROTN). Ranked 6th in TN School Bus.
- **National – complete GRID revised** for Tamil Nadu, Kerala, Karnataka and Andhra Pradesh & Telangana (`GRID_Oct_V2_Changes_-_Effective_22-10-2026.xlsx`). All earlier National rates are replaced. Weight bands go into every GVW section they overlap (e.g. 7501 to 16500 → MCV 7501–12000 and MCV 12001–20000); Long Term Package (5+5 / 3+3) → Bundle; E-rickshaw → PCV – Auto; E-cart → LCV – Auto GCV & E-Kart; Ambulance → Misc-D Other; restricted-RTO rates carry their own RTO list.
- **Kshema, Kerala, Two-Wheeler – revised** (23 Oct 2026 from `EG_GRID_Kshema_Kerala.xlsx`, which replaces the Kshema Kerala rows of the change workbook): Bundle (New), Package and SAOD (Renewal / Rollover) for Bike and Scooter, by make (Honda, TVS & Suzuki · Bajaj · Hero & Yamaha · other makes) and electric. Best: Scooter Bundle **32.50**, Scooter Package **30.00**, Scooter SAOD **25.00**; Bike 12.50 (electric 20.00 / SAOD 15.00). Declined: all TW above 350cc & IDV above 3 Lakhs; KTM, Triumph, Ultraviolette, BMW, Harley-Davidson. The remark *CPA mandatory – without CPA: 2.5% payout deduction; TPPD Discount = Yes: 2.5% payout deduction* applies to **Bundle policies only** (as in the sheet) — not to Package or SAOD; this is the same for Kshema in every state. Kshema's Kerala commercial-vehicle rates are unchanged.
- **Version 1** now runs 06-10-2026 to 21-10-2026. It now also holds the **earlier Kshema Kerala Two-Wheeler rates** (first sent with the October Version 2 changes, taken from `GRID_Oct_V2_Changes_-_Effective_22-10-2026.xlsx`), so Version 2's Kshema Kerala rates show how much they went up or down. Version 1 Kerala: 566 rates (was 556); Kshema's Kerala Two-Wheeler rates in Version 1 are labelled New. All other Version 1 rates are unchanged.
- Build rule fix: *Taxi (5+1)* now goes only to PCV – Taxi (Upto 6-Seater) (it was also listed under Taxi & Stage Bus). Version 1 is not affected.

### The page
- **Multi-key search** in the search box — keys can be combined with each other and with ordinary words:
  `age<12` · `age 5-10` · `age>=15` · `age new` · `age rollover` (vehicle age in years) · `cc<=150` · `cc 1200` (engine CC, Private Car / Two-Wheeler) · `fuel:diesel` · `fuel petrol / cng / ev` · `make:tata` · `make honda` · `rto:TN07` · `rto KL 07` · `gvw:7500` · `gvw<12000` (LCV / MCV / HCV) · `seats:20` · `seats>30` (PCV). Operators: `<` `<=` `>` `>=` `=`, a range `5-10`, or words (below, upto, above, more than). Example: `age<12 fuel:diesel rto:TN07`, `school bus age 8 seats 40`.
  - **Vehicle age in whole years:** `age 10` = a 10-year-old vehicle — "Up to 10", "6 – 10", "Above 5 to 10" apply; "Above 10", "More than 10", "Above 10 to 15", "10 years above" start at **11** (`age>10` = 11 and above). "10 & above" / "10 onwards" include 10. New = 0; Rollover / Renewal = 1 year and above.
  - A rate is shown when **one of its conditions** (the parts joined by OR) meets every key together. With keys in the search, each rate shows only the conditions that met them (e.g. `age 10` shows the "Up to 10 Years" line, not the "Above 10 to 15" line of the same rate). A condition that says nothing about a key applies to all values of it (no age wording = every age).
  - Declined parts are taken out: "Declined: All TW above 350cc" is not shown for `cc 500`, "Except Electric" not for `fuel ev`, "Other than TATA" not for `make tata`, an RTO declined or "except Chennai" not for that RTO; "All TN & PY RTO" counts as covering TN07. A declined *model* list does not exclude the whole make.
  - The recognised keys appear as small tags next to the rate count. A plain `GVW 1547` still shows the ranked GVW list.
- Versions that haven't started yet are now **listed as UPCOMING** in the version bar (previously hidden), so a new version can be checked before its start date. The version that applies today still opens first.
- **Declined remarks are static red** — no more blinking.
- **Rate change labels** next to the insurer name, in both versions: **▲ Increased** (green), **▼ Decreased** (red), **New** (no earlier rate). Hovering a label shows the earlier rate.
  - Version 2 is compared with Version 1 (the *Earlier* version against the one that *Applies today*): 122 increased, 40 decreased, 63 new — National in all states, TATA AIG TN School Bus (58.00 → 61.00, increased), Kshema Kerala Two-Wheeler (against the earlier Kshema Kerala rates now in Version 1 — e.g. Scooter Bundle 35.00 → 32.50 ▼ −2.50, Scooter Package 27.50 → 30.00 ▲ +2.50, electric Bike Bundle 12.50 → 20.00 ▲ +7.50). Rates whose value did not change (only the wording) carry no label.
  - Version 1 is compared with the original October workbook: ICICI TN Auto Diesel (11 → 46), New India TN School Bus (56 → 66), Reliance School Bus TN (66 → 68.5) and KL / KA / AP-TS (70 → 71) increased; Royal Sundaram TN Private Car – SATP (16 entries) new.
  - Rates are compared part by part — OD with OD, TP with TP (a flat rate counts for both) — so 20(OD)+20(TP) → 30 reads as increased.
  - Each label shows **by how much**: *▲ Increased +3.00* (TATA AIG 58 → 61), *▼ Decreased −5.00(OD)* (11(OD)+2(TP) → 6(OD)+2(TP)), *▲ Increased +5.00(OD) +10.00(TP)* (15(OD)+20(TP) → 20(OD)+30(TP)), *▲ Increased TP +5.00* (TP column, when Package is unchanged). Where one rate replaces several earlier rates, a range is shown (e.g. +15.00 to +20.00).
  - Search **increased**, **decreased**, **new rate** or **revised** to list them.

### Build scripts (`monthly-update/`)
- A supplement can **replace an insurer's whole GRID** (`"replaces": ["National"]`) or just one product of it (`"replaces": [{"company": "Kshema", "block": "TW"}]`), corrections can **drop** a withdrawn row, and `remark_add` (optional) adds wording the business asks for that isn't in the sheet — not used in this release. See `monthly-update/README.md`.
- Rebuilding Release 1's Version 1 with these scripts gives exactly the same data as before.

## Release 1 — 13 Oct 2026

First release of the consolidated deployment kit. Replaces every earlier kit (`Motor-Smart-GRID-Deploy-Kit_Oct2026_v1.0`, builds 1–22).

**If an earlier build is on the server:** replace the whole `/smart-grid/` folder with `smart-grid/` from this kit. Delete leftovers of earlier layouts if present: `data/grid-data.json`, `2026-10-v1/`, `2026-10-v2/`, `assets/hub.js`, `analytics/`. Keep `counter-data/count.json` to keep the visitor total.

### The page
- One GRID page holds every version. Filters stay fixed at the top; below them a **GRID month** dropdown (newest month first) and that month's version boxes on one line: *Version 1 · 06-Oct to 31-Oct · APPLIES TODAY*.
- The version that applies today (India time) opens first. Other versions are marked EARLIER; versions that haven't started yet are hidden until their start date.
- **Vehicle-age selector (New | Both | Rollover / Renewal): built but switched OFF for now** (13 Oct 2026). The age wording in the GRID data needs checking before it is used to filter rates; planned for next month. To turn it on, set `var AGE_FILTER_ON = false;` to `true` in `monthly-update/template.html` and rebuild; that also brings back the "Age (Com/TP): All ages" label on rates with no age wording.
- **Every open or refresh starts with cleared filters**: Tamil Nadu, all segments, all insurers, empty search, and the version that applies today. The page no longer remembers the last state or search between visits (also when returning with the browser's Back button).
- Switching month or version keeps the chosen state, segment, insurers and search. The heading above the rates and the filter bar show which version is open.
- Each version ends the day before the next version starts; the dates adjust automatically when a version is added.
- Ranking: highest Package payout first (TP where Package is NA); top three highlighted, the leader marked BEST. Search covers insurer, segment, RTO and remarks; `GVW: 1547` finds every weight band covering that weight.
- Data protection: rates shipped encoded; right-click, copy, inspect, view-source, save and print are blocked; the GRID hides while developer tools are open. Real protection still needs portal login (see `DEPLOYMENT_GUIDE.md` §5).
- "Today's visitors: N · Total visitors: N" at the bottom. A visit is one browser on one day (India time): same-day reloads don't add, a return on a later day counts again. Nothing else about visitors is recorded; `counter-data/count.json` keeps the day-by-day totals. Health check: `visitor-counter.php?check=1`; when the counter can't run, the page explains why in the browser console. The single file now uses the counter too (`single-file/` includes it).
- Body text uses **Atkinson Hyperlegible** (embedded), a font designed so that i, l and I never look alike; numbers keep plain (unslashed) zeros. Server configs now allow `font-src data:` for it.

### October 2026 — Version 1 (06-10-2026 to 31-10-2026)
Source: `From_6th_To_31st_Oct_PAYOUT_Grid_2026.xlsx` + `RSA_Missing_GRID_-_Oct_26.xlsx` — 3,667 rates (TN 928 · KL 556 · KA 855 · AP-TS 1,328) as first released; from Release 2 it also holds the earlier Kshema Kerala Two-Wheeler rates (3,677 · KL 566). Maharashtra not included (no `MH PO` sheet in the workbook).

Revisions and additions on top of the workbook (`monthly-update/corrections_Oct2026_v1.json`, supplement files in `source/`):
- **ICICI, TN, PCV – Auto, Diesel:** 11.00 / 11.00 → **46.00 / 46.00**, only for the listed Tamil Nadu RTO RC locations (Madurai, Vellore, … Theni). Remark: "Commission applicable only if the business sourced from Chennai Code: IM-2358692".
- **New India, TN, PCV – School Bus:** 56.00 → **66.00**, policy issuance only at Vadavalli (721502), Coimbatore (721600) and Pollachi (722200) branches.
- **Reliance, PCV – School Bus:** TN 66.00 → **68.50**; KL, KA, AP-TS 70.00 → **71.00**, with the *POSP Special Offer!* badge.
- **Shriram:** the hazardous-category remark reads "Declined New Mahindra. Doable Hazardous category - …" wherever the full list appears.
- IFFCO GVW search shows each rate once.
- **Royal Sundaram, TN, Private Car – SATP (added 13 Oct 2026):** 29 TP rates from `RSA_Missing_GRID_-_Oct_26.xlsx`, by fuel type (Diesel / Other than Diesel), CC band and RTO cluster (Chennai, Coimbatore, Erode, Kanchipuram, Madurai, Namakkal, Rest of TN, Salem, Thiruvallur, Trichy, Vellore). Payouts 2.00 to 30.00; best is 30.00 (Other than Diesel, Above 1500 CC), ranked 5th in TN Private Car – SATP. Rates with the same value are shown as one entry with OR conditions, so the 29 rows plus the existing 2 Pondicherry rates appear as 16 entries.

### Kit
- `smart-grid/` — website folder to upload (was `option-B-split/`).
- `single-file/motor-smart-grid.html` — one-file fallback (was `option-A-single-file/`).
- `monthly-update/make_site.py` + `versions.json` — builds both from the listed versions; a version can include supplement workbooks with extra rows.
- Server configs for nginx / Apache / IIS, iframe snippet, UAT checklist, checksums.
