# UAT & Go-Live Checklist — Motor Smart GRID, October 2026 Version 2

Tick each item on the **portal URL** (not the claude.ai UAT link) on desktop and on one Android/iOS phone.

## Version bar
- [ ] Below the filters: **GRID month [October 2026 ▼]** then **Version 1 · 06-Oct to 21-Oct · Earlier**, **Version 2 · 22-Oct to 25-Oct** and **Version 3 · 26-Oct to 31-Oct** (on 25-10-2026 Version 2 is *Applies today* and Version 3 *Upcoming*; from 26-10-2026 Version 3 *Applies today*)
- [ ] From 26-10-2026 Version 3 opens first; heading reads **▾ Smart Grid October 2026 - Version 3 - 26-10-2026 to 31-10-2026**
- [ ] Version 3, United India: TN Taxi Upto 7 **6.00 ▼ −5.00**; KL Taxi Upto 7 **31.00 / 31.00 ▲ +10.00**; KL Goods 7501–10000 **23.50 ▲ +5.00**; AP-TS Goods 20001–25000 **21.00 ▲ +10.00**; TN Private Car Package upto 1000CC **12.50 ▼ −2.50**; Private Car SAOD **20.00(OD) ▲ +10.00**; no "Except OEMs and DIESEL" 35.00 rate
- [ ] Version 3, United India Sub Annexure 3: search `rto TN13 cc 1100` (Tamil Nadu) → Private Car Bundle / Package / SATP **30.00 ▲ +15.00**; `rto TN01 cc 1100` → **12.50 ▼ −2.50**; `rto PY03 cc 1100` → 30.00; `rto KA23 cc 1100` (Karnataka) → 30.00; `rto KA01 cc 1100` → 12.50
- [ ] Search `seats<=15`: only Taxi, Taxi & Stage Bus, School Bus and Staff Bus sections — **no PCV – Auto**
- [ ] ICICI commercial-vehicle rates show TP **NA** in every version (e.g. TN LCV Upto 2000 39.00 / NA)
- [ ] Version 3 still shows the Version 2 labels (e.g. TATA AIG School Bus 61.00 ▲ +3.00, Kshema KL Scooter Bundle 32.50 ▼ −2.50); Version 3 counts TN 939 · KL 575 · KA 868 · AP-TS 1,342
- [ ] (Once there are 2+ months) choosing a month in the dropdown shows its versions and opens the one that applied last in that month
- [ ] A version whose start date is still ahead is listed as **Upcoming** and opens when clicked
- [ ] (When there are 2+ versions) clicking another version keeps the chosen state, segment, insurers and search, and shows that version's rates
- [ ] Masthead shows **22 – 31 October 2026 (Version 2)**; badge **October 2026 · v2**
- [ ] Clicking Version 1 shows **06 – 21 October 2026 (Version 1)** with Tamil Nadu **928** rates
- [ ] Private Car – SATP (TN): Royal Sundaram 30.00 for Chennai RTOs (Other than Diesel, Above 1500 CC); search "KANCHIPURAM" shows the 28.00 Diesel rate
- [ ] ICICI · PCV – Auto · 46.00 Diesel condition reads "Commission applicable only if the business sourced from Chennai Code: IM-2358692"
- [ ] No "could not be loaded" message; browser console has no red errors (a blocked Google Fonts request is acceptable)

## Data (expected counts, "All segments / All insurers", empty search)
- [ ] State list shows exactly: Tamil Nadu, Kerala, Karnataka, Andhra Pradesh & Telangana
Version 2:
- [ ] Tamil Nadu → **943** rates shown
- [ ] Kerala → **577**
- [ ] Karnataka → **872**
- [ ] Andhra Pradesh & Telangana → **1,344**

Version 1: TN 928 · KL **566** · KA 855 · AP-TS 1,328

## Spot checks against the source Excel (TN)
- [ ] LCV (Upto 2000): top row **United India 56.00 / 56.00**, marked BEST
- [ ] PCV – Auto: top row **ICICI 61.00 / 61.00**
- [ ] PCV – School Bus: top row **Kshema 71.00 / 71.00**; **TATA AIG 61.00 / 61.00** "Above 12 seats | RTO: All TN RTOs" (Version 2) — no other TATA AIG school-bus row
- [ ] Insurer = National: rates show "Age (Com/TP): …" and RTO "All TN & PY RTO…" (Version 2 National GRID)
- [ ] Kerala, Insurer = Kshema, Two-Wheeler – Bundle: Scooter – Bundle **32.50** (Package 30.00, SAOD 25.00), Bundle conditions end "CPA mandatory – without CPA: 2.5% payout deduction; TPPD Discount = Yes: 2.5% payout deduction"; Kshema Package and SAOD rates (all states) do **not** carry that remark
- [ ] Declined remarks (red) do not blink
- [ ] Version 2, TN: TATA AIG School Bus 61.00 shows green **▲ Increased +3.00**; hovering shows "Earlier rate: Package 58.00"
- [ ] Version 2, TN: National MCV 12001–20000 6.00(OD)+2.00(TP) shows red **▼ Decreased −5.00(OD)**; National Private Car – Package 20.00(OD)+30.00(TP) shows **▲ Increased +5.00(OD) +10.00(TP)**
- [ ] Version 1, TN: ICICI Auto 46.00 shows **▲ Increased +35.00**; New India School Bus **+10.00**; Reliance School Bus **+2.50**
- [ ] Version 2, TN: National Two-Wheeler – Bundle "Bike – Bundle" 5.00(OD)+0.00(TP) shows red **▼ Decreased**; National Private Car – Package 20.00(OD)+30.00(TP) shows **▲ Increased**; Kerala, Kshema: Scooter – Bundle 32.50 shows **▼ Decreased −2.50** (was 35.00), Scooter – Package 30.00 **▲ Increased +2.50**; Bike – Bundle 12.50 has no label (unchanged)
- [ ] Version 2: rates of other insurers (unchanged from Version 1) have no label; searching "decreased" lists only red-labelled rates
- [ ] Version 1, TN: ICICI Auto 46.00, New India School Bus 66.00 and Reliance School Bus 68.50 show **▲ Increased**; Royal Sundaram Private Car – SATP rates show **New**
- [ ] Two-Wheeler – Package: top row **HDFC ERGO 50.00**

## Functions
- [ ] Search `age<12 fuel:diesel rto:TN07` (TN): tags "Age < 12 yrs · Fuel: diesel · RTO TN07" show next to the count; no rate declining TN07, "Except Diesel" or only for vehicles above 12 years appears
- [ ] `national age 10` (TN): "Up to 10 Years" rates shown, "Above 10 Years to 15 Years" not; `national age 11` shows "Above 10 Years to 15 Years" and not "Up to 10 Years"
- [ ] `cc 500` (TN): no Two-Wheeler rate with "Declined: All TW above 350cc"; `fuel ev`: no "Except Electric" / "EV decline" rate; `age new`: no Rollover / Renewal-only rate
- [ ] `school bus age 8 seats 40` lists only School Bus rates usable for an 8-year-old 40-seat bus; plain `GVW 1547` still shows the ranked GVW list
- [ ] Segment filter shows one segment; Insurer filter narrows to selected insurers; Clear filters resets
- [ ] Search "TN37" returns rates whose RTO list includes TN37
- [ ] Search `GVW 19920` (TN) shows 30 segments, Magma 21.00 first, IFFCO "0 To 40000" listed once
- [ ] No rate appears twice in any GVW search result
- [ ] Mobile: cards layout, no sideways scrolling, filters usable
- [ ] Choose another state, an insurer and a search, then refresh: the page opens again on Tamil Nadu with all filters cleared

## Data protection
- [ ] Right-click on the GRID does nothing; F12 / Ctrl+Shift+I do not open developer tools from the page
- [ ] Ctrl+U, Ctrl+S, Ctrl+P do nothing; print preview shows "Printing is disabled"
- [ ] Rate text cannot be selected or copied; the search boxes still accept typing and paste
- [ ] Opening developer tools from the browser menu hides the GRID ("Protected content"); closing them brings it back
- [ ] `data/2026-10-v1.json` (website folder) shows only `{"enc":"…"}`, with no insurer names
- [ ] The page opens only for logged-in portal users

## Visitor counter
- [ ] Vercel: `/api/visitor-counter?check=1` shows `"result": "OK - the counter can work"` (PHP hosting: `/smart-grid/visitor-counter.php?check=1`)
- [ ] The bottom of the page shows "Today's visitors: N · Total visitors: N"
- [ ] First visit from a new browser adds 1 to both; reloading or switching versions the same day does not; opening it again the next day adds 1 to the total and to that day's count
- [ ] PHP hosting only: `/smart-grid/counter-data/count.json` does NOT open from a browser (403 / 404). Vercel: `/visitor-counter.php` gives 404 (kept out by `.vercelignore`)

## Go-live
- [ ] `no-cache` headers active on `.json` / `.html` (DevTools → Network → Response headers)
- [ ] Previous release kept for rollback
- [ ] Portal menu link / iframe page updated
- [ ] Signed off by: ____________________  Date: __________
