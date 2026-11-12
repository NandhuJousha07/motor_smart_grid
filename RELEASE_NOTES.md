# Release Notes — EG Smart GRID

## November 2026 · Version 2, build 25 — 11 Nov 2026 (TATA AIG Taxi removed)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **TATA AIG – PCV Taxi (Upto 6-Seater) and PCV Taxi & Stage Bus (More than 6-seats):** all lines removed in KA (4) and AP-TS (8), November Versions 1 and 2.
- November V2: 4,454 rates (TN 1,119 · KL 656 · KA 1,015 · AP-TS 1,664).

## November 2026 · Version 2, build 24 — 11 Nov 2026 (Zuno November GRID)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **Zuno – Karnataka and AP-TS (November Versions 1 and 2), from Zuno's November GRID (08-11-2026):**
  - LCV up to 3.5 ton (Upto 2000 and 2001 to 3500): 43.50 / 43.50 (−2.50); Tata, Maruti, Mahindra & Ashok Leyland only, other makes declined.
  - AP-TS 3W Auto (LCV Auto GCV & E-Kart) line removed.
  - Agricultural Tractor (one engine with one registered trailer): New 41.00 / 41.00 (+2.00), Renewal/Rollover 37.00 / 37.00.
  - Private Car: New (Bundle) 20.00 (OD); Package and SAOD With NCB 20.00 (OD), Without NCB 14.50 (OD); SATP 22.50.
- November V2: 4,466 rates (TN 1,119 · KL 656 · KA 1,019 · AP-TS 1,672).

## November 2026 · Version 2, build 23 — 10 Nov 2026 (Raheja PCV Auto segment name)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **Raheja – PCV Auto (TN, KA, AP-TS):** segment name changed from "AUTO RIKSHAW" to **"Auto (3+1) Only*"** (November Versions 1 and 2). Payout and remarks unchanged.

## November 2026 · Version 2, build 22 — 10 Nov 2026 (United India Auto segment name)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **United India – PCV Auto (TN, KL, KA, AP-TS):** segment name changed from "3W AUTO(3+1)" to **"3W Auto"** (November Versions 1 and 2). Payout and remarks unchanged.

## November 2026 · Version 2, build 21 — 10 Nov 2026 (ICICI Private Car new vehicle)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **ICICI – Private Car – New vehicle (Bundle):** the "Without NCB" line (14.50 OD) is removed in TN, KL, KA and AP-TS (November Versions 1 and 2); the new-vehicle line now shows 22.50 (OD) only. Package and SAOD lines are unchanged.
- November V2: 4,465 rates (TN 1,119 · KL 656 · KA 1,018 · AP-TS 1,672).

## November 2026 · Version 2, build 20 — 10 Nov 2026 ("What's changed" flash message)

Replace the page files: Option B `index.html`, `assets/app.js`, `assets/styles.css` and `data/grid-data.json`; Option A the single HTML file.

- **"What's changed" flash:** when a version that has changes is opened (clicking it in the version bar, or when it opens by default on its start date), a running message under the version heading lists each change — insurer, state, segments and package types. It pauses on mouse-over, can be closed with ×, and is hidden for versions without a change list (e.g. November Version 1). With reduced-motion turned on it shows as still text.
- **November Version 2 message:** "Kshema – Karnataka · Two-Wheeler: Bike & Scooter – Bundle (New 1+5), Package & SAOD payout revised for Rest of Karnataka (excluding Bangalore)". Rates unchanged from build 19.
- For a new version, add `"flash": [{"insurer": "...", "state": "...", "text": "..."}]` to that version in the GRID data.

## November 2026 · Version 2, build 19 — 10 Nov 2026 (Royal Sundaram Private Car labels removed)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **Royal Sundaram – Private Car Package, SAOD and New Car (Bundle):** the "Decreased −5.00" labels from build 17 are removed (November Versions 1 and 2). Payouts are unchanged.
- November V2: 4,469 rates. Change labels: Increased 213 · Decreased 433 · Mixed 22 · Newly added GRID 388.

## November 2026 · Version 2, build 18 — 10 Nov 2026 (Kshema revised Two-Wheeler terms, Rest of Karnataka)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **New version: Smart Grid November 2026 – Version 2, 15-11-2026 to 30-11-2026** (effective date of Kshema's mail "Revised 2W Terms For ROKA & UP East", 07 Nov 2026). Version 1 now ends 14-11-2026; both stay in the version selector.
- **Kshema – Karnataka – Two-Wheeler, Rest of Karnataka (excluding Bangalore):** New (1+5 Bundle), Package and SAOD payouts replaced with the revised terms. Most are **+5.00** (e.g. Honda/TVS/Suzuki, Bajaj, Hero & Yamaha scooters: Bundle 55, Package 30, SAOD 25; bikes up to 350cc: Bundle 30, Package 20, SAOD 15; Bajaj bike Bundle 22.50); Others-EV Bundle 55 (+20.00); EV scooter (TVS, Chetak, Ather, Vida, Ampere, River) Package 35 (−10.00) and SAOD 25 (−20.00). Labels compare against November Version 1. Bangalore lines are unchanged. Remarks: CPA/TPPD deductions (Bundle), Royal Enfield considered under Others, declined makes KTM, Triumph, Ultraviolette, BMW, Harley-Davidson. UP East is not in the GRID.
- November V2: 4,469 rates (TN 1,120 · KL 657 · KA 1,019 · AP-TS 1,673). Change labels: Increased 213 · Decreased 479 · Mixed 22 · Newly added GRID 388.

## November 2026 · Version 1, build 17 — 10 Nov 2026 (Royal Sundaram Private Car margin)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **Royal Sundaram – Private Car Package, SAOD and New Car (Bundle), all states:** payout corrected to the standard 5% margin (they had been shown at Royal Sundaram's base rate). Each is **5.00 lower** (▼ Decreased −5.00 against October), e.g. Chennai Package 21 / 16 (with / without NCB), SAOD 17 / 12, New Car 25 / 27 / 30 (other makes 23). 46 rates. Private Car TP-only was already at the 5% margin and is unchanged.
- Change labels: Increased 203 · Decreased 479 · Mixed 20 · Newly added GRID 388. Total rates unchanged (4,468).

## November 2026 · Version 1, build 16 — 04 Nov 2026 (ICICI TN Auto remark)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **ICICI – Tamil Nadu – PCV Auto, Diesel 11.00 (Tamil Nadu RTOs):** remark added **"For other than ICICI Chennai code"**, so it is not read against the 56.00 line, which applies only to policies issued from the ICICI Chennai code. No rates changed.

## November 2026 · Version 1, build 15 — 04 Nov 2026 (Tamil Nadu: TN & PY RTOs only)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **Tamil Nadu now shows only TN and Puducherry (PY) RTOs.** Removed: Andaman & Nicobar lines (Chola MS 176 conditions, 70 lines; IndusInd (Reliance) 15 conditions), Andaman codes AN01/AN02 from SBI TN lists (23 lines) and Lakshadweep codes LD01–LD09 from TATA AIG TN "ROTN" lists (7 lines). Rates of the remaining lines are unchanged.
- November V1: 4,468 rates (TN 1,120 · KL 657 · KA 1,018 · AP-TS 1,673). Change labels: Increased 203 · Decreased 433 · Mixed 20 · Newly added GRID 388.

## November 2026 · Version 1, build 14 — 03 Nov 2026 (Vercel: whole-kit deployment)

Add the new files at the **kit root**: **`vercel.json`** and **`api/visitor-counter.js`**. Page and data are unchanged.

- Fixes "page doesn't exist" (404) when the whole kit folder is the Vercel project: the kit root had no `index.html`, and the counter function was not at the root. Now the site address opens the GRID from `option-B-split`, `/api/visitor-counter` works from the root, and the kit's scripts, notes, sources and server configs answer 404 (not public).
- Vercel settings: Root Directory empty, Framework Preset "Other", no Build Command / Output Directory. Then connect Upstash for Redis and redeploy (`DEPLOYMENT_GUIDE.md` section 9).

## November 2026 · Version 1, build 13 — 03 Nov 2026 (visitor counter for Vercel)

Deploy the new files: **`api/visitor-counter.js`** and **`visitor-counter.php`** (in both option folders). Page and data are unchanged.

- **Visitor counter now works on Vercel:** the earlier kits had no counter function, so `/api/visitor-counter` answered 404 and the footer line stayed hidden. Added the Vercel serverless function `api/visitor-counter.js` (counts stored in Upstash Redis, connected from the Vercel Storage tab) and `visitor-counter.php` for PHP hosting. Setup and checks: `DEPLOYMENT_GUIDE.md` section 9 and `UAT_CHECKLIST.md`.
- A visit = one browser per day (India time), by an anonymous cookie; nothing else is stored.

## November 2026 · Version 1, build 12 — 03 Nov 2026 (FG renamed)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **FG is now shown as "Generali Central (FG)"** — the insurer's name has officially changed. October versions keep "FG" as published. No rates changed.

## November 2026 · Version 1, build 11 — 03 Nov 2026 (POSP Special Offer removed)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **"POSP Special Offer!"** (IndusInd (Reliance) TN School Bus: extra 3% on ₹5L volume) is removed from November. October versions keep it as published. No rates changed.

## November 2026 · Version 1, build 10 — 03 Nov 2026 (page renamed)

Option B: replace `index.html`, `assets/app.js` and `assets/styles.css` (the data file is unchanged). Option A: replace the single HTML file.

- The page is now called **EG Smart GRID** (browser tab title, page heading and on-screen messages). No rates changed.
- A separate page, **Capivision GRID**, is prepared for the 8% margin business (not part of this kit).

## November 2026 · Version 1, build 9 — 03 Nov 2026 (Raheja November proposal grid)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **Raheja (South: TN, KA, AP-TS; Kerala excluded)** — November proposal grid applied:
  - GCV 2501 – 3500: **45.00 / 45.00** (was 41 / 41) ▲ Increased +4.00
  - HCV Flat Bed: **22.00 / 23.00** (was 23 / 23) ▼ Decreased −1.00 (TP unchanged)
  - PCV Auto Rickshaw: **46.00 / 46.00** (was 44 / 44) ▲ Increased +2.00
  - Unchanged: GCV upto 2500 (46), GCV 3501 – 7500 (23, KA & AP-TS), Agri Tractor (36), Private Car (Bundle 27, Package 25 / 17, SAOD 14.50 / 10, TP-only 20).
- November V1: 4,538 rates (TN 1,190 · KL 657 · KA 1,018 · AP-TS 1,673). Change labels: Increased 203 · Decreased 432 · Mixed 21 · Newly added GRID 468.

## November 2026 · Version 1, build 8 — 03 Nov 2026 (IndusInd (Reliance) School Bus, corrected)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **IndusInd (Reliance) – PCV School Bus** (corrects build 7): **TN stays at the October payout 68.50 / 68.50** (approval; All TN RTOs except TN28, TN88, TN34, TN27, TN30, TN52, TN54, TN77, TN90, TN93, TN47, TN33, TN56, TN86). **KL, KA and AP-TS use the November rate 70.00 / 70.00** (▼ Decreased −1.00 against October's 71). The KL line includes Lakshadweep (newly added); Andaman & Nicobar and Puducherry School Bus stay out.
- November V1: 4,538 rates (TN 1,190 · KL 657 · KA 1,018 · AP-TS 1,673). Change labels: Increased 197 · Decreased 429 · Mixed 21 · Newly added GRID 468.

## November 2026 · Version 1, build 7 — 03 Nov 2026 (IndusInd (Reliance) School Bus)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **IndusInd (Reliance) – PCV School Bus:** approval received to keep the existing (October) School Bus payout. The November file's School Bus rates are not used. Restored: **TN 68.50 / 68.50** (All TN RTOs except TN28, TN88, TN34, TN27, TN30, TN52, TN54, TN77, TN90, TN93, TN47, TN33, TN56, TN86), **KL, KA and AP-TS 71.00 / 71.00**, with no change label. The Andaman & Nicobar, Puducherry and Lakshadweep School Bus lines from the November file are no longer shown.
- November V1: 4,538 rates (TN 1,190 · KL 657 · KA 1,018 · AP-TS 1,673). Change labels: Increased 197 · Decreased 427 · Mixed 20 · Newly added GRID 468.

## November 2026 · Version 1, build 6 — 03 Nov 2026 (IndusInd (Reliance) November grid)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **Reliance is now shown as "IndusInd (Reliance)"** — the insurer's name has officially changed. October versions keep the name "Reliance" as published.
- **IndusInd (Reliance) November rates** replace all Reliance lines (67 → 101 rates) in TN (incl. Puducherry and Andaman & Nicobar), KL (incl. Lakshadweep), KA and AP-TS: LCV, School Bus, Taxi, Flat Bed, Auto, Tractor, Construction Equipment, Private Car (Bundle, Package, SAOD) and Two-Wheeler (Bundle 1+5 and 5+5, Package, SAOD, TP-only).
- Main changes against October (School Bus: see build 7): Two-Wheeler Bundle 1+5 lower by 2.50–3.00 (Mysore & Mangalore 2.50); Mysore & Mangalore Two-Wheeler Package / SAOD 10 (was 32.50 / 40); TN Two-Wheeler SAOD 45 (was 40); Maruti without NCB now a separate, lower Private Car rate. Newly added: Mahindra (other than Jeeto & Supro) up to 2000, Private Car Bundle, Two-Wheeler 5+5 Bundle, Tractor (KA, AP), Auto (Bangalore), Construction Equipment (Hyderabad), Andaman & Nicobar and Lakshadweep.
- Two-Wheeler Bundle remark: "2nd year: same payout % applicable (paid on 1st LT posting)". Private Car Bundle: "3+3: payout on 1st year OD premium only".
- November V1 now has 4,538 rates (TN 1,190 · KL 657 · KA 1,018 · AP-TS 1,673). Change labels: Increased 197 · Decreased 429 · Mixed 22 · Newly added GRID 468.

## November 2026 · Version 1, build 5 — 03 Nov 2026 (Shriram goods carrying: BharatBenz declined)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **Shriram – goods carrying (LCV, MCV, HCV) – all states:** remarks now include **"Declined Make: BharatBenz"** (shown in red). Added to 93 conditions on 89 rates. Not added where the rate is already limited to one make or model ("Only TATA Make", "Only Bolero Model"), or to Auto GCV / E-Kart.
- No rates or rankings changed (4,504 rates).

## November 2026 · Version 1, build 4 — 03 Nov 2026 (TATA AIG TN School Bus)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **TATA AIG – Tamil Nadu – PCV School Bus:** TATA AIG approved continuing **October's payout for November**. The three November lines (58 / 56 / 53 by RTO zone and seating) are replaced by the October line: **61.00 / 61.00, Above 12 seats, All TN RTOs**, with no change label. It ranks 7th in TN School Bus (tied at 61).
- November V1 now has 4,504 rates (TN 1,184 · KL 654 · KA 1,003 · AP-TS 1,663). Change labels: Increased 196 · Decreased 414 · Mixed 12 · Newly added GRID 428.

## November 2026 · Version 1, build 3 — 03 Nov 2026 (Liberty Private Car TN & KA)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **Liberty – Private Car Package and SAOD – Tamil Nadu and Karnataka:** Liberty approved continuing the **October grid for November**, so the November file's rates for these are not used. The October lines are back: **22.00 (OD)** Package and SAOD, TN (all TN & PY RTOs, declined TN16, TN23, TN25, TN31, TN32, TN73, TN83, TN91, TN97) and KA (all KA RTOs), with no change label.
- Liberty Private Car SATP (TN, KA) and Liberty in other states stay as per the November file.
- November V1 now has 4,506 rates (TN 1,186 · KA 1,003). Change labels: Increased 196 · Decreased 417 · Mixed 12 · Newly added GRID 428.

## November 2026 · Version 1, build 2 — 03 Nov 2026 (IFFCO special approval)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **IFFCO – Tamil Nadu – Goods Carrying CV up to 40 ton** (special approval for November 2026, TN RTO vehicles only, BharatBenz declined): now **18.50 Package / 18.00 TP** (was 19.00 / 19.00), shown in LCV Upto 2000, LCV 2001–3500, LCV 3501–7500, MCV 7501–12000, MCV 12001–20000 and HCV 20000–40000, each with a **▼ Decreased** label.
- No other rates changed. Change labels now: Increased 196 · Decreased 428 · Mixed 12 · Newly added GRID 428.

## November 2026 · Version 1 — 03 – 30 November 2026 (built 03 Nov 2026)

Deploy **all files** this time — the page itself changed since the October kit (build 4).
Option B: replace `index.html`, `assets/styles.css`, `assets/app.js` and `data/grid-data.json`. Option A: replace the single HTML file.

### Versions in this file
| Version | Dates | Rates |
|---|---|---|
| October 2026 – Version 1 | 06-10-2026 to 21-10-2026 | 3,675 |
| October 2026 – Version 2 | 22-10-2026 to 25-10-2026 | 3,734 |
| October 2026 – Version 3 | 26-10-2026 to **02-11-2026** (was 31-10) | 3,720 |
| **November 2026 – Version 1** | **03-11-2026 to 30-11-2026** | **4,513** |

The page opens the version that applies today; earlier versions sit under the "GRID month" selector.

### November rates updated (payables only)
| Insurer | What was updated |
|---|---|
| Magma | All segments |
| TATA AIG | Commercial and Two-Wheeler (Private Car unchanged from October) |
| SBI | All segments |
| Shriram | All segments |
| ICICI | Commercial — TP shown only where ICICI's AOTP sheet gives a payout; Chennai-code PCV Auto line ("Valid only if policy issued from ICICI Chennai code") |
| Royal Sundaram | GCV — one line per make (TATA & AL / Eicher / Others), New and Rollover, with / without Nil Dep |
| Universal Sompo | GCV |
| Liberty | All segments |
| Chola MS | All segments; Two-Wheeler, Andaman & Nicobar and Lakshadweep newly added |
| Go Digit | Tamil Nadu Private Car and Two-Wheeler (SAOD now make-wise) |
| Kotak | November grid same as October; Two-Wheeler lines removed (declined by Kotak) |

IFFCO: see build 2 above. All other insurers (National, Oriental, United India, Kshema, New India, HDFC ERGO, Bajaj, FG, Zuno) are carried from October unchanged.

### Change labels
Every November rate is compared with October Version 3: **Increased** 196 · **Decreased** 422 (428 after build 2) · **Mixed** 12 · **Newly added GRID** 428. Hover a label to see the earlier rate.

### Page changes since the October kit
- Month-wise versions (Version 1, 2, …) under one page, with "Applies today" / "Earlier" badges.
- Multi-keyword search: separate phrases with ";" — e.g. `Royal Sundaram; with nil dep`, `SBI; without ncb`. "with nil dep" never matches "without nil dep"; Nil Dep / Nil Dip / Zero Dep are treated alike.
- Doable makes are listed first in remarks and declined makes last (only the declined part is red).
- "Total visitors" count at the bottom.
- GRID data is stored protected (not readable JSON).

### Clean-up in November V1
- Zero-payout lines removed (Reliance Private Car Package Diesel/EV without NCB, ICICI AP-TS TVS Bike Bundle).
- RTO codes normalised so code search works (Kotak KA codes typed in Greek letters; "TN-01" style codes).

### Server config
- CSP `font-src` now allows `data:` (the page embeds its body font).
