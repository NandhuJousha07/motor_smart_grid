# Deployment Guide — Motor Smart GRID

## 1. Before you start

1. Verify the files: `sha256sum -c checksums.sha256` (Linux/macOS) or `Get-FileHash` in PowerShell — all lines must say OK.
2. Read `manifest.json` and confirm version **November 2026 - Version 1**, period **03 – 30 November 2026**.
3. Pick a URL, e.g. `https://<your-portal>/smart-grid/`.

## 2. Option B — split build (recommended)

1. Copy the **contents** of `option-B-split/` to the web folder, keeping the structure:
   ```
   /smart-grid/
     index.html
     assets/styles.css
     assets/app.js
     data/grid-data.json
   ```
2. Apply the matching server config from `server-config/` (nginx block, `.htaccess`, or `web.config`). The important parts:
   - `data/*.json` and `*.html` served with `Cache-Control: no-cache` so users never see last month's rates.
   - JSON served as `application/json` (IIS needs the MIME mapping in `web.config`).
   - gzip/compression on — the data file is ~11 MB raw (four versions, protected encoding), a few MB compressed.
3. Open `https://<your-portal>/smart-grid/` and run `UAT_CHECKLIST.md`.

**Data in a different location?** Edit one line in `index.html`:
`<meta name="grid-data-url" content="data/grid-data.json">` — point it to any same-origin URL (e.g. `/api/smart-grid/current.json`). A cross-domain URL needs CORS on that server.

## 3. Option A — single file

1. Upload `option-A-single-file/motor-smart-grid.html` to the portal (any name, any folder).
2. If the portal sends a Content-Security-Policy, it must allow inline script: `script-src 'self' 'unsafe-inline'`. If that's not allowed, use Option B.
3. Serve it with `Cache-Control: no-cache` (configs in `server-config/` cover `.html`).

## 4. Putting it in the portal

- **Menu link (simplest, best on mobile):** link to `/smart-grid/index.html`.
- **Inside a portal page:** use `embed/portal-embed-snippet.html` (iframe). Host the GRID on the same domain; the provided CSP uses `frame-ancestors 'self'`, so if the portal page is on another domain, add it there (e.g. `frame-ancestors 'self' https://portal.example.com`).
- The page has its own sticky filter bar and mobile layout — give the iframe the full content width and at least ~640 px height.

## 5. Security notes

- Static, read-only page: no forms, no login, no cookies. The only request it makes is the optional visitor count: a POST to `/api/visitor-counter` (Vercel) or `visitor-counter.php` on the same site. If neither exists the page uses its own local count.
- GRID data is stored protected (encoded), and the page blocks right-click / copy / view-source shortcuts. These are deterrents, not security — keep the GRID behind portal login if it must not be public.
- It saves the last selected state and search text in the viewer's own browser (localStorage) for convenience only.
- Option B works under a strict CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'`.
  (`'unsafe-inline'` in style-src is needed for small inline table/highlight styles.)
- To drop Google Fonts entirely, delete the three `fonts.googleapis.com / fonts.gstatic.com` `<link>` lines at the top of the HTML; the page uses system fonts instead.
- Contains commission rates — place it behind portal login if it should not be public.

## 6. Updates (new month or new version)

Each release file holds **every version** (October V1–V3, November V1, …). The page opens the version that applies today, and older ones stay under "GRID month".

The MIS team (or Claude, in the Smart GRID project) produces the release with `monthly-update/make_release.py`:

```bash
# normal case - full GRID data from the Smart GRID project:
python3 monthly-update/make_release.py grid-data.json release_Dec2026

# or add a new version from a PAYOUT Grid workbook on top of the live release:
pip install -r monthly-update/requirements.txt          # once (openpyxl)
python3 monthly-update/make_release.py "From_XX_To_YY_Dec_PAYOUT_Grid_2026.xlsx" release_Dec2026 \
    --prev option-B-split/data/grid-data.json --month "December 2026" \
    --start 2026-12-01 --end 2026-12-31 [--note "..."] [--corrections corrections_Dec2026.json]
```

Output: `release_Dec2026/option-A-single-file/…`, `release_Dec2026/option-B-split/…`, `release_Dec2026/manifest.json`.

Deploying an update:
- **Option B:** replace only `data/grid-data.json` (replace `index.html`/`assets/` only when the release notes say the page changed).
- **Option A:** replace the single HTML file.
- Mid-month changes go into the current version; a new version starts only when the business says so (the previous version's end date then moves to the day before).

## 7. Rollback

Keep the previous release folder. To roll back, restore the previous `data/grid-data.json` (Option B) or previous HTML (Option A). The masthead, version bar and bottom-right badge show the live version and period, so you can confirm at a glance.

## 8. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| "GRID data could not be loaded – HTTP 404" | `data/grid-data.json` missing or wrong path → check the folder structure / `grid-data-url` meta. |
| "…could not be loaded" + `Unexpected token <` | Server returns an HTML error page instead of JSON → add the `.json` MIME type (IIS) or fix the rewrite rule. |
| Blank page, console shows CSP error | Option A under a strict CSP → switch to Option B or allow `'unsafe-inline'` scripts. |
| Old month still showing | Browser/CDN cache → apply the `no-cache` headers; purge CDN for `*.json` and `*.html`. |
| Works on server but not from desktop double-click | Expected for Option B (`file://`); use Option A for offline viewing. |
| Fonts look different | Google Fonts blocked by network → harmless system-font fallback. |
