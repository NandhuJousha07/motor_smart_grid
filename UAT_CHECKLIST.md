# UAT & Go-Live Checklist — Motor Smart GRID v1.0 (06 – 31 Oct 2026)

Tick each item on the **portal URL** (not the claude.ai UAT link) on desktop and on one Android/iOS phone.

## Page & version
- [ ] Masthead shows **06 – 31 October 2026 (Version 1.0)**
- [ ] Bottom-right badge shows **October 2026 · v1.0**
- [ ] No "could not be loaded" message; browser console has no red errors (a blocked Google Fonts request is acceptable)

## Data (expected counts, "All segments / All insurers", empty search)
- [ ] State list shows exactly: Tamil Nadu, Kerala, Karnataka, Andhra Pradesh & Telangana
- [ ] Tamil Nadu → **915** rates shown
- [ ] Kerala → **556**
- [ ] Karnataka → **855**
- [ ] Andhra Pradesh & Telangana → **1,328**

## Spot checks against the source Excel (TN)
- [ ] LCV (Upto 2000): top row **United India 56.00 / 56.00**, marked BEST
- [ ] PCV – Auto: top row **ICICI 61.00 / 61.00**
- [ ] PCV – School Bus: top row **Kshema 71.00 / 71.00**
- [ ] Two-Wheeler – Package: top row **HDFC ERGO 50.00**

## Functions
- [ ] Segment filter shows one segment; Insurer filter narrows to selected insurers; Clear filters resets
- [ ] Search "TN37" returns rates whose RTO list includes TN37
- [ ] Search `GVW 19920` (TN) shows 30 segments, Magma 21.00 first, IFFCO "0 To 40000" listed once
- [ ] No rate appears twice in any GVW search result
- [ ] Mobile: cards layout, no sideways scrolling, filters usable
- [ ] Reload keeps the last chosen state

## Data protection
- [ ] Right-click on the GRID does nothing; F12 / Ctrl+Shift+I do not open developer tools from the page
- [ ] Ctrl+U, Ctrl+S, Ctrl+P do nothing; print preview shows "Printing is disabled"
- [ ] Rate text cannot be selected or copied; the search boxes still accept typing and paste
- [ ] Opening developer tools from the browser menu hides the GRID ("Protected content"); closing them brings it back
- [ ] `data/grid-data.json` (Option B) shows only `{"enc":"…"}`, with no insurer names
- [ ] The page opens only for logged-in portal users

## Visitor counter
- [ ] The bottom of the GRID shows "Total visitors: N"
- [ ] First visit from a new browser adds 1; reloading the page does not
- [ ] `/smart-grid/counter-data/count.json` does NOT open from a browser (403 / 404)

## Go-live
- [ ] `no-cache` headers active on `.json` / `.html` (DevTools → Network → Response headers)
- [ ] Previous release kept for rollback
- [ ] Portal menu link / iframe page updated
- [ ] Signed off by: ____________________  Date: __________
