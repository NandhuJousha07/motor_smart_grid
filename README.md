# Motor Smart GRID — Deployment Kit

**Release:** Version 1.0 · 06 – 31 October 2026
**States:** Tamil Nadu, Kerala, Karnataka, Andhra Pradesh & Telangana
**Rates:** 3,654 (TN 915 · KL 556 · KA 855 · AP-TS 1,328)
**UAT copy:** the claude.ai Smart GRID link (same build as this kit)

Start here, then follow `DEPLOYMENT_GUIDE.md`.

## What's in the box

| Folder / file | Purpose | Who uses it |
|---|---|---|
| `option-A-single-file/motor-smart-grid.html` | One self-contained page (design, script and data in one file). Upload and open — nothing else needed. | Dev team — quickest go-live |
| `option-B-split/` | Same page split into `index.html`, `assets/styles.css`, `assets/app.js`, `data/grid-data.json`, plus `visitor-counter.php` for the "Total visitors" line. Monthly update = replace **one JSON file**. Works with a strict CSP (no inline script). | Dev team — **recommended** for the portal |
| `embed/portal-embed-snippet.html` | iframe snippet to show the GRID inside an existing portal page | Dev team |
| `server-config/` | Ready configs for nginx, Apache (`.htaccess`) and IIS (`web.config`): caching, compression, security headers | Dev / server team |
| `monthly-update/` | Scripts that turn next month's PAYOUT Grid Excel into a new release (both options) | MIS team |
| `source/` | The PAYOUT Grid workbook this release was built from (audit trail) | MIS team |
| `manifest.json` | Version, period, rate counts, build time | Everyone |
| `checksums.sha256` | File fingerprints — confirm the upload wasn't altered | Dev team |
| `DEPLOYMENT_GUIDE.md` | Step-by-step deployment, hosting, embedding, rollback | Dev team |
| `UAT_CHECKLIST.md` | Sign-off checks before and after go-live | MIS + Dev |
| `RELEASE_NOTES.md` | What changed in this release | Everyone |

## Which option should we use?

- **Option B (split)** if the portal has any Content-Security-Policy, if you want the monthly update to be a single data-file swap, or if you will host it as a folder (e.g. `/smart-grid/`).
- **Option A (single file)** if the CMS only accepts one uploaded HTML file, or for a quick test.

Both behave identically (same filters, search, GVW lookup, mobile layout) — verified side by side.

## Requirements

- Any static web hosting (nginx / Apache / IIS / S3 / CMS file upload). No database, no server code, no login.
- HTTPS recommended. Option B must be served over http(s) — it does not work when opened as a local file (browsers block loading the JSON from `file://`). Option A works either way.
- Browsers: current Chrome, Edge, Safari, Firefox; Android & iOS.
- Only external dependency: Google Fonts (IBM Plex). If blocked, the page falls back to system fonts automatically — nothing breaks.
