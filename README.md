# EG Smart GRID — Deployment Kit

**Release:** November 2026 · Version 2 · 15 – 30 November 2026 (Version 1: 03 – 14 November 2026)
**States:** Tamil Nadu, Kerala, Karnataka, Andhra Pradesh & Telangana
**Rates (November V2):** 4,482 from 23 insurers (TN 1,120 · KL 665 · KA 1,022 · AP-TS 1,675)
**Also inside:** October 2026 Versions 1–3, under the "GRID month" selector (October V3 now ends 02-11-2026)

Start here, then follow `DEPLOYMENT_GUIDE.md`.

## What's in the box

| Folder / file | Purpose | Who uses it |
|---|---|---|
| `option-A-single-file/motor-smart-grid.html` | One self-contained page (design, script and data in one file). Upload and open — nothing else needed. | Dev team — quickest go-live |
| `option-B-split/` | Same page split into `index.html`, `assets/styles.css`, `assets/app.js`, `data/grid-data.json`, plus the visitor counter (`api/visitor-counter.js`, `visitor-counter.php`). A data-only update = replace **one JSON file**. Works with a strict CSP (no inline script). | Dev team — **recommended** for the portal |
| `vercel.json` + `api/visitor-counter.js` | Vercel: deploy the whole kit as the project — the site opens the GRID, `/api/visitor-counter` counts visits, other kit files stay private (404) | Dev team (Vercel) |
| `embed/portal-embed-snippet.html` | iframe snippet to show the GRID inside an existing portal page | Dev team |
| `server-config/` | Ready configs for nginx, Apache (`.htaccess`) and IIS (`web.config`): caching, compression, security headers | Dev / server team |
| `monthly-update/` | Release script and page template that turn the GRID data into both options | MIS team |
| `source/` | Where this release's data came from (insurer files stay with MIS — they contain receivable commission) | MIS team |
| `manifest.json` | Current version, period, rate counts, all versions in the file, build time | Everyone |
| `checksums.sha256` | File fingerprints — confirm the upload wasn't altered | Dev team |
| `DEPLOYMENT_GUIDE.md` | Step-by-step deployment, hosting, embedding, rollback | Dev team |
| `UAT_CHECKLIST.md` | Sign-off checks before and after go-live | MIS + Dev |
| `RELEASE_NOTES.md` | What changed in this release | Everyone |

## Which option should we use?

- **Option B (split)** if the portal has any Content-Security-Policy, if you want updates to be a single data-file swap, or if you will host it as a folder (e.g. `/smart-grid/`).
- **Option A (single file)** if the CMS only accepts one uploaded HTML file, or for a quick test.

Both behave identically (same versions, filters, multi-keyword search, change labels, GVW lookup, mobile layout) — verified side by side for this build.

## Requirements

- Any static web hosting (Vercel / nginx / Apache / IIS / S3 / CMS file upload). No database, no login.
- HTTPS recommended. Option B must be served over http(s) — it does not work when opened as a local file (browsers block loading the JSON from `file://`). Option A works either way.
- Browsers: current Chrome, Edge, Safari, Firefox; Android & iOS.
- Only external dependency: Google Fonts (IBM Plex Serif). If blocked, the page falls back to system fonts automatically — nothing breaks.
- Visitor counter: the footer "Today's visitors · Total visitors" needs the included `api/visitor-counter.js` (Vercel) plus a connected Upstash Redis database, or `visitor-counter.php` (PHP hosting). Setup: `DEPLOYMENT_GUIDE.md` section 9. Without it the line stays hidden — nothing else breaks.
