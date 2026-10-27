# Motor Smart GRID — Deployment Kit

Everything needed to put the Motor Smart GRID on the website and keep it updated, in one kit.

**What the page does:** one GRID page with every version in it. The filters (state, segment, insurer, search,) stay fixed at the top. Below them a **GRID month** dropdown and that month's version boxes (e.g. *Version 1 · 06-Oct to 31-Oct · APPLIES TODAY*). The version that applies today (India time) opens first; picking another version keeps the filters. Versions that haven't started yet are listed as *UPCOMING*, so they can be checked before their start date.

**Versions in this kit:**
- Smart Grid October 2026 - Version 1 - 06-10-2026 to 21-10-2026 (3,675 rates: TN 928 · KL 565 · KA 855 · AP-TS 1,327)
- Smart Grid October 2026 - Version 3 - 26-10-2026 to 31-10-2026 (3,724 rates: TN 939 · KL 575 · KA 868 · AP-TS 1,342) — United India revised commission (circular 23.10.2026) with Sub Annexure 3 preferred RTOs (Private Car 1001–1200 CC, TN/PY/KA: 30.00)
- Smart Grid October 2026 - Version 2 - 22-10-2026 to 25-10-2026 (3,734 rates: TN 943 · KL 576 · KA 872 · AP-TS 1,343) — TATA AIG TN School Bus 61%, National GRID revised (all states), Kshema Two-Wheeler added for Kerala

**States:** Tamil Nadu, Kerala, Karnataka, Andhra Pradesh & Telangana
**UAT copy:** the claude.ai Smart GRID link (same page and versions as this kit)

## Deploy in 4 steps (dev team)

1. Check the files: `sha256sum -c checksums.sha256` — every line must say OK.
2. Copy the **`smart-grid/`** folder to the website's web root, so the page is at `https://<your-portal>/smart-grid/`.
3. **Vercel:** connect an *Upstash for Redis* database (Storage tab, free plan) to the project and redeploy — the visitor counter is `smart-grid/api/visitor-counter.js` (`DEPLOYMENT_GUIDE.md` section 2a). **Other servers:** apply the matching file from `server-config/` (nginx, Apache `.htaccess` or IIS `web.config`) and make `smart-grid/counter-data/` writable by the web server.
4. Open `https://<your-portal>/smart-grid/` and tick `UAT_CHECKLIST.md`.

Details, hosting options, embedding, security and troubleshooting: `DEPLOYMENT_GUIDE.md`.

## What's in the kit

| Folder / file | Purpose | Who uses it |
|---|---|---|
| `smart-grid/` | **The website folder — upload this.** `index.html`, `assets/`, `data/` (version list + one rates file per version, loaded only when opened), `api/visitor-counter.js` + `vercel.json` + `.vercelignore` (Vercel), `visitor-counter.php` + `counter-data/` (PHP hosting). Works under a strict Content-Security-Policy. | Dev team |
| `single-file/motor-smart-grid.html` | The same page as one self-contained file (every version inside). For a CMS that accepts only one HTML file, or a quick test. Grows ~2.5 MB per version. | Dev team (fallback) |
| `server-config/` | nginx, Apache (`.htaccess`) and IIS (`web.config`): no-cache for rates, compression, security headers, counter folder blocked | Dev / server team |
| `embed/portal-embed-snippet.html` | iframe snippet to show the GRID inside an existing portal page | Dev team |
| `monthly-update/` | Scripts that rebuild `smart-grid/` and `single-file/` from the PAYOUT Grid workbooks listed in `versions.json` | MIS team |
| `source/` | The PAYOUT Grid workbooks the versions were built from, plus supplement files with extra rows (e.g. `RSA_Missing_GRID_-_Oct_26.xlsx`, `GRID_Oct_V2_Changes_-_Effective_22-10-2026.xlsx`, `EG_GRID_Kshema_Kerala.xlsx`, `United_India_Sub_Annexure_3_Preferred_RTOs_26-10-2026.xlsx`) and the United India circular PDFs — audit trail | MIS team |
| `manifest.json` | Every version with its dates, rate counts and manual corrections; build time | Everyone |
| `checksums.sha256` | File fingerprints — confirm nothing was altered in transit | Dev team |
| `DEPLOYMENT_GUIDE.md` | Step-by-step deployment, new versions, rollback, troubleshooting, visitor counter | Dev team |
| `UAT_CHECKLIST.md` | Sign-off checks before and after go-live | MIS + Dev |
| `RELEASE_NOTES.md` | What this release contains | Everyone |
| `FONT-LICENSE-Atkinson-Hyperlegible-OFL.txt` | Licence for the embedded body font (SIL Open Font License 1.1) | Everyone |

## Adding a version later

When a revision or a new month's GRID comes in, the MIS team adds one entry to `monthly-update/versions.json`, runs `python3 monthly-update/make_site.py .` and gives the dev team the new `smart-grid/` folder. The previous version's end date adjusts automatically. See `DEPLOYMENT_GUIDE.md` section 6.

## Requirements

- Vercel, or any web hosting that serves static files (nginx / Apache / IIS / CMS). Visitor counter: on Vercel an Upstash for Redis database (free); elsewhere PHP 7.4+ (optional).
- HTTPS recommended. `smart-grid/` must be served over http(s); it doesn't work opened as a local file. `single-file/` works either way.
- Browsers: current Chrome, Edge, Safari, Firefox; Android & iOS.
- Fonts: body text uses Atkinson Hyperlegible, embedded in the page (no download; licence in `FONT-LICENSE-Atkinson-Hyperlegible-OFL.txt`). Headings use IBM Plex Serif from Google Fonts; if that is blocked, they fall back to Georgia. The Content-Security-Policy needs `font-src 'self' data:` (already in `server-config/`).
