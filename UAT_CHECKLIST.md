# UAT & Go-Live Checklist — Motor Smart GRID · November 2026 Version 1 (03 – 30 Nov 2026)

Tick each item on the **portal URL** on desktop and on one Android/iOS phone.

## Page & version
- [ ] Masthead shows **03 – 30 November 2026 (Version 1)**
- [ ] Version bar: "GRID month" = **November 2026**, Version 1 **03-Nov to 30-Nov** with the **Applies today** badge
- [ ] Bottom-right badge shows **November 2026 · v1**
- [ ] No "could not be loaded" message; browser console has no red errors (a blocked Google Fonts request, and a visitor-counter request that is not set up, are acceptable)

## Data (expected counts, "All segments / All insurers", empty search)
- [ ] State list shows exactly: Tamil Nadu, Kerala, Karnataka, Andhra Pradesh & Telangana
- [ ] Tamil Nadu → **1,189** rates shown
- [ ] Kerala → **654**
- [ ] Karnataka → **1,007**
- [ ] Andhra Pradesh & Telangana → **1,663**

## Spot checks (Tamil Nadu, November V1)
- [ ] LCV (Upto 2000): top row **United India 56.00 / 56.00**, marked BEST
- [ ] PCV – Auto: top row **ICICI 61.00 / NA**
- [ ] PCV – School Bus: top row **Kshema 71.00 / 71.00**
- [ ] Two-Wheeler – Package: top row **HDFC ERGO 50.00**
- [ ] Private Car – Package: top row **United India 30.00**
- [ ] Labels visible: e.g. search "Go Digit" → Scooter – SATP TN Good RTOs 28.00 shows **▲ Increased +13.00**

## Functions
- [ ] Segment filter shows one segment; Insurer filter narrows to selected insurers; Clear filters resets
- [ ] Search "TN37" returns rates whose RTO list includes TN37
- [ ] Search `Royal Sundaram; with nil dep` (Tamil Nadu) returns only Royal Sundaram With Nil Dep rates
- [ ] Search `GVW: 9000` shows only segments whose weight band covers 9,000 kg
- [ ] GRID month → **October 2026** opens October Version 3 (26 October – 02 November 2026); back to November works
- [ ] Mobile: cards layout, no sideways scrolling, filters usable
- [ ] Reload keeps the last chosen state

## Go-live
- [ ] `no-cache` headers active on `.json` / `.html` (DevTools → Network → Response headers)
- [ ] Previous release kept for rollback
- [ ] Portal menu link / iframe page updated
- [ ] Signed off by: ____________________  Date: __________
