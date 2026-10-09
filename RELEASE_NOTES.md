# Release Notes — Motor Smart GRID

## Version 1.0, build 14 — 09 Oct 2026 (visitor counter replaces visitor analytics)

Option B: replace `index.html` and `assets/app.js`, add `visitor-counter.php` and the `counter-data/` folder. Remove the `analytics/` folder if it was installed. For Option A, replace the single HTML file. Rates unchanged.

- **"Total visitors: N"** now shows at the bottom of the GRID for everyone.
- **All visitor recording is removed:** no per-visit records, no admin dashboard, no daily email, and the `portal-analytics/` folder is gone from the kit. The only thing kept is a count.
- Website: `visitor-counter.php` counts each browser once and keeps only the total, in `counter-data/count.json`. claude.ai: each signed-in visitor is counted once.
- Server configs (nginx / Apache / IIS) now block `counter-data/` instead of the old analytics files.

## Version 1.0, build 13 — 09 Oct 2026 (usage notice removed)

Replace `index.html` and `assets/app.js` (Option B), or the single HTML file (Option A). The data file and rates are unchanged.

- The one-line "Usage notice: visits to this page are recorded…" was removed from the GRID footer. Visitors see nothing about analytics. Visits are still recorded, and the admin dashboard and daily email are unchanged.

## Version 1.0, build 12 — 09 Oct 2026 (Reliance School Bus – KL, KA, AP-TS)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **Reliance – PCV School Bus** in **Kerala, Karnataka and Andhra Pradesh & Telangana** revised from **70.00 / 70.00** to **71.00 / 71.00**, the normal slab of the "Special School Bus GRID for South". Each carries the offer badge: **⚡ POSP SPECIAL OFFER!** Hit ₹5L volume to unlock an additional 3.0% payout (71% → 74%). No seating capacity restrictions.
- Ranking: AP-TS 1st. KL and KA tie with Kshema at 71.00, so the source order decides: Reliance is 1st in KL and 2nd in KA. RTO conditions are unchanged.
- Recorded in `monthly-update/corrections_Oct2026.json` (KL PO 586, KA PO 666, AP-TS PO 1324).

## Version 1.0, build 11 — 09 Oct 2026 (Reliance TN School Bus + POSP offer badge)

Replace **all three** files in Option B: `index.html`, `assets/app.js` (new offer badge) and `data/grid-data.json`. For Option A, replace the single HTML file.

- **Reliance – Tamil Nadu – PCV School Bus** revised from **66.00 / 66.00** to **68.50 / 68.50**, the normal slab of the "Special School Bus GRID for South". It now ranks 2nd in TN School Bus (Kshema 71.00 is 1st, New India 66.00 is 3rd). The RTO exclusions are unchanged and match the poster's blocked RTOs: TN28, TN88, TN34, TN27, TN30, TN52, TN54, TN77, TN90, TN93, TN47, TN33, TN56, TN86.
- **New: promotional offer badge.** A rate can now carry a highlighted offer, shown in its own gold-and-orange style below the remarks, separate from the grey remarks. Reliance TN School Bus shows: **⚡ POSP SPECIAL OFFER!** Hit ₹5L volume to unlock an additional 3.0% payout (68.5% → 71.5%). No seating capacity restrictions. Searching "POSP" or "5L" finds it.
- Offers are set through `monthly-update/corrections_Oct2026.json` (`"offer": {"title": …, "text": …}`). This one is TN PO row 886. The source Excel is untouched.

## Version 1.0, build 10 — 08 Oct 2026 (one rate revised)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **ICICI – Tamil Nadu – PCV Auto (Fuel Type: Diesel)** revised from **11.00 / 11.00** (ROTN RTO codes TN11 … TN97) to **46.00 / 46.00**, with the condition "Only for the Tamil Nadu RTO RC locations": Madurai, Vellore, Nilgiri, Tenkasi, Mettupalayam, Dharmapuri, Tiruppur, Villupuram, Salem, Chengalpattu, Tirunelveli, Dindigul, Tiruvannamalai, Thanjavur, Gudalur, Chidambaram, Ramanathpuram, Kallakurichi, Cuddalore, Pollachi, Virudhunagar, Sivagangai, Vaniyambadi, Kumbakonam, Karur, Periakulam, Ranipettai, Kancheepuram, Tuticorin, Pudukkottai, Ooty, Nagercoil, Marthandam, Srirangam, Udumalpet, Tiruvallur, Tiruvarur, Tindivanam, Tiruchirappalli, Thiruchendur, Thiruverumbur, Theni (42 locations).
- It shares one entry with ICICI's existing TN Auto 46.00 / 46.00 Petrol/CNG rate, shown as two "OR" conditions. That entry ranks 6th in TN PCV Auto. Total rates: 3,653 (one fewer entry because of this merge).
- The ICICI Diesel Auto rates for Chennai (18.00) and Coimbatore (6.00) are unchanged.
- Recorded in `monthly-update/corrections_Oct2026.json` (TN PO row 775). The source Excel is untouched.

## Version 1.0, build 9 — 08 Oct 2026 (visitor analytics for your own website)

Option B: replace `index.html` (it now sends visits to `analytics/collect.php`) and add the new `analytics/` folder. Rates unchanged.

- **New `portal-analytics/analytics/` (PHP):**
  - `collect.php` stores each visit.
  - `report.php` emails the **daily visitor report** to the admin (SMTP or server mail), run by the server's scheduler.
  - `dashboard.php` is the **admin-only dashboard**, password-protected, with a CSV export.
  - `config.php` holds the settings.
- **Admin only:** visitors never see analytics on the GRID page. The settings, shared code and database are blocked from the web (`.htaccess`, `web.config`, nginx rules), and the dashboard needs the admin password, with lock-out after 5 wrong tries.
- **Named visitors:** link your portal login in `config.php` (`identify`) and the report and dashboard show each visitor's name and email.
- Tested end to end on PHP 8.3: page visit → stored → email delivered to a test mail server → dashboard sign-in, figures and CSV export.
- `server-config/nginx.conf` gained the analytics blocks. DEPLOYMENT_GUIDE.md section 9 is the setup guide.

## Version 1.0, build 8 — 08 Oct 2026 (nginx config fix)

No page or data changes. Only `server-config/nginx.conf` and the deployment guide changed.

- **Fixed:** the nginx config in builds 1–7 returned **404 "page not found"** for `index.html` and the data file even when the files were uploaded correctly. Its nested rules dropped the folder location. It's now rewritten with plain `root` rules and a redirect for `/smart-grid` without the final slash.
- DEPLOYMENT_GUIDE.md section 8 now has a "Page not found" checklist covering folder level, file names, case, permissions, IIS and WordPress.

## Version 1.0, build 7 — 08 Oct 2026 (visitor analytics)

Replace `index.html` and `assets/app.js` (Option B), or the single HTML file (Option A). The data file is unchanged.

- **Visitor tracking.** Each visit records the visitor's account, date and time, time spent on the page, device, browser, operating system, screen size, language and time zone, plus the states viewed, segments opened, insurers filtered, searches and GVW lookups. No rates changed.
- **On claude.ai:** visits are saved in the page's own database. The owner sees a **Visitor analytics** button with:
  - headline figures: total visits, unique visitors, visits today, returning visitors and average time on page
  - a visits-per-day chart
  - top devices, browsers, states, segments, insurers and searches
  - a per-visitor table and the full visit log
  - Today / 7 / 30 days / All time filters, an option to include your own visits, and a CSV export
  Only signed-in visitors who can contribute (organisation members, Contributors and above) can be recorded. View-only and signed-out visitors cannot write on this platform, so they are not counted.
- **On your portal:** set `<meta name="grid-analytics-endpoint" content="https://…">` in `index.html` and each visit is POSTed there as JSON. See DEPLOYMENT_GUIDE.md, section 9.
- A short usage notice in the footer tells visitors that visits are recorded.

## Version 1.0, build 6 — 08 Oct 2026 (data protection)

Replace **all three** files in Option B: `index.html`, `assets/app.js` and `data/grid-data.json` (the data file format changed). For Option A, replace the single HTML file.

- **Rate data is now encoded.** Insurer names, rates and remarks no longer appear as readable text in the page source, the saved file or the browser's network tab.
- **Inspect and copy deterrents:** right-click, F12, Ctrl+Shift+I / J / C, Ctrl+U (view source), Ctrl+S (save), Ctrl+P (print) and Ctrl+A / Ctrl+C outside the search boxes are blocked. Text selection, dragging and printing are disabled. Typing and copy/paste inside the search boxes still work.
- **The GRID hides while developer tools are open** and shows "Protected content – Close developer tools to view the Motor Smart GRID". It comes back automatically once they're closed.
- Search engines are told not to index the page (`noindex, nofollow`).
- Phone view: long RTO lists now wrap, so the page no longer scrolls sideways.
- No rates changed.

These are deterrents. A browser must receive the data to show it, so a skilled user can still extract it, for example by disabling JavaScript or taking screenshots. For real control, host the GRID behind the portal login (see DEPLOYMENT_GUIDE.md, section 5).

## Version 1.0, build 5 — 07 Oct 2026 (GVW search fix)

Option B: replace `assets/app.js` only (data unchanged). Option A: replace the single HTML file.

- **GVW search no longer repeats the same rate.** A rate written for a wide weight range (e.g. IFFCO "0 To 40000") is listed under every LCV/MCV/HCV band it covers, so the GVW search used to show it once per band (IFFCO appeared 6 times for "GVW 19920"). Each distinct rate now appears once. Example, TN "GVW 19920": 50 rows → 30. Browsing by segment is unchanged: a wide-range rate still shows in each band it covers.
- No rates changed.

## Version 1.0, build 4 — 06 Oct 2026 (one rate revised)

Option B: replace `data/grid-data.json` only. Option A: replace the single HTML file.

- **New India – Tamil Nadu – PCV School Bus** revised from **56.00 / 56.00, ALL RTO** to **66.00 / 66.00**, with the condition "Policy Issuance allowed only in below mentioned Branches Vadavalli (Br ID – 721502), Coimbatore (Br ID – 721600), Pollachi (Br ID – 722200)". It now ranks 2nd in TN School Bus, tied at 66 with Reliance (Kshema is 1st at 71). Other states are unchanged.
- The change is in `monthly-update/corrections_Oct2026.json`, applied on top of the source workbook (TN PO row 885), so the original Excel stays untouched. It is listed in `manifest.json`.

## Version 1.0, build 3 — 06 Oct 2026 (same October rates, wording fix)

Replace **all three** files in Option B: `index.html`, `assets/app.js` and `data/grid-data.json`. For Option A, replace the single HTML file.

- **Shriram remarks:** only where the full text "Hazardous category - Chemical Category, Gas Category, Hydrogen Category, ITB (Integrated Tug Barges) Category, LNG Carrier Category, Oil Category, Petrol / Diesel Category, Slurry Category, Wine/Alcohal Category, LPG/CNG Carrier Category, Flammable liquids Category" appears, it now reads **"Declined New Mahindra. Doable Hazardous category - <same list>"**. Any "Except/Expect New Mahindra and/-" written just before it is folded into that wording. Text in front of it, such as "Whole KA RTO codes - ", is kept. All other Shriram remarks are exactly as in the source sheet. The rule is built into the monthly script.
- The red "declined" highlight now stops at the end of its sentence, so the Doable hazardous list is no longer shown in red.
- No rates changed (3,654 rates, same values and ranking).

## Version 1.0, build 2 — 06 Oct 2026 (same October data, page fix)

Replace `index.html` **and** `assets/app.js` (Option B), or the single HTML file (Option A). `data/grid-data.json` is unchanged.

- **Esc now closes the Insurer and Segment dropdowns** after picking with the keyboard (Arrow keys + Space), after ticking with the mouse, or from anywhere on the page. Focus returns to the dropdown button.
- After a keyboard pick, the cursor stays in the dropdown's search box, so you can keep using the arrow keys and Space.
- The insurer list keeps the typed filter after a pick (before, the full list reappeared while e.g. "kot" was still typed).
- After Enter picks a segment, focus returns to the Segment button.

## Version 1.0 — 06 – 31 October 2026 (built 06 Oct 2026)

**Source:** `From_6th_To_31st_Oct_PAYOUT_Grid_2026.xlsx`

### Data
- Fresh GRID from the October PAYOUT Grid: 3,654 rates across 24 segments.
- States: TN (915), KL (556), KA (855), AP-TS (1,328).
- **Maharashtra not included** — the October workbook has no `MH PO` sheet. It will be added in v1.1 once the sheet is received.
- September's Royal Sundaram revision note removed (new month).
- Kerala has no HCV Flat Bed offers this month (section not shown for KL).
- Excluded as before: United India Motor Trade (not a vehicle segment).

### Rule change
- Taxi rates given without a seat range (e.g. plain "Taxi") now appear under **both** PCV Taxi sections (Upto 6-Seater and More than 6-seats), instead of only "More than 6-seats".

### Unchanged
- Ranking: highest Package payout first (TP used where Package is NA); top 3 highlighted, best marked BEST.
- Same page design, filters, search and GVW weight-band lookup as the September release.

### Deployment
- New: Option B split build (`index.html` + `assets/` + `data/grid-data.json`) — monthly updates replace only the JSON file.
- New: server configs (nginx / Apache / IIS), iframe embed snippet, monthly release script, checksums.
