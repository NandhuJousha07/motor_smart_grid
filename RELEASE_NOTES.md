# Release Notes — Motor Smart GRID

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

All other insurers (National, Oriental, United India, Kshema, New India, Reliance, HDFC ERGO, Bajaj, Raheja, FG, Zuno, IFFCO) are carried from October unchanged.

### Change labels
Every November rate is compared with October Version 3: **Increased** 196 · **Decreased** 422 · **Mixed** 12 · **Newly added GRID** 428. Hover a label to see the earlier rate.

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
