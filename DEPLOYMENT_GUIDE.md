# Deployment Guide — Motor Smart GRID

## 1. Before you start

1. Verify the files: `sha256sum -c checksums.sha256` (Linux/macOS) or `Get-FileHash` in PowerShell — all lines must say OK.
2. Read `manifest.json` and confirm version **1.0**, period **06 – 31 October 2026**.
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
   - gzip/compression on — the data file is ~1.9 MB raw, ~110 KB compressed.
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

**Built-in data protection (from build 6).** The rate data is shipped encoded (`{"enc": "..."}`), not as readable JSON. The page blocks right-click, inspect / view-source / save / print shortcuts, copying and text selection, and hides the GRID while developer tools are open. These measures stop casual copying only; anyone with the link and enough skill can still get the data. **The only real protection is access control:** serve `/smart-grid/` only to logged-in portal users (portal session check, or server-level authentication such as nginx `auth_request` / `auth_basic`, Apache `Require valid-user`, or IIS Windows/Forms authentication). Never publish it at a public, unauthenticated URL.

The encoding key is `GRID_KEY` in `monthly-update/make_release.py` and `__GRID_KEY` in `monthly-update/template.html`. If you change it, change it in both places.


- Static, read-only page: no forms, no login, no cookies, no data sent anywhere. It does not call any external API.
- It saves the last selected state and search text in the viewer's own browser (localStorage) for convenience only.
- Option B works under a strict CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'`.
  (`'unsafe-inline'` in style-src is needed for small inline table/highlight styles.)
- To drop Google Fonts entirely, delete the three `fonts.googleapis.com / fonts.gstatic.com` `<link>` lines at the top of the HTML; the page uses system fonts instead.
- Contains commission rates — place it behind portal login if it should not be public.

## 6. Monthly update (every new PAYOUT Grid)

The MIS team (or Claude, in this project) produces a new release with `monthly-update/`:

```bash
pip install -r monthly-update/requirements.txt          # once (openpyxl)
python3 monthly-update/make_release.py "From_XX_To_YY_Nov_PAYOUT_Grid_2026.xlsx" release_Nov2026 \
    --period "01 – 30 November 2026" --month "November 2026" --version 1.0
# mid-month revision example:
#   --version 1.1 --note "Royal Sundaram GCV revised, effective 16 Nov 2026"
# with manual corrections on top of the workbook:
#   --corrections monthly-update/corrections_Nov2026.json
```

Output: `release_Nov2026/option-A-single-file/…`, `release_Nov2026/option-B-split/…`, `release_Nov2026/manifest.json`.

Deploying an update:
- **Option B:** replace only `data/grid-data.json` (replace `index.html`/`assets/` only when the release notes say the design changed).
- **Option A:** replace the single HTML file.

The workbook must keep the current layout: one sheet per state named `TN PO`, `KL PO`, `KA PO`, `AP-TS PO` (and `MH PO` when Maharashtra is included), with the usual header row (Vehicle Category / Company / Age / Discount / Package / TP / Remark / RTO). A state whose sheet is missing is simply left out. The script prints rate counts per state — compare with the previous month before publishing.

## 7. Rollback

Keep the previous release folder. To roll back, restore the previous `data/grid-data.json` (Option B) or previous HTML (Option A). The masthead and the bottom-right badge show the live version and period, so you can confirm at a glance.

## 8. Troubleshooting

### "Page not found" / 404

Work through these in order. Most deployments fail on 1 or 2.

1. **Wrong folder level.** The server folder must contain the files **directly**:
   ```
   smart-grid/index.html          <- correct
   smart-grid/option-B-split/index.html                    <- wrong (one level too deep)
   smart-grid/Motor-Smart-GRID-Deploy-Kit_.../...          <- wrong (whole kit uploaded)
   ```
   Copy the **contents** of `option-B-split/`, not the folder itself, and not the zip.
2. **Option A file name.** The single file is called `motor-smart-grid.html`. Either open `/smart-grid/motor-smart-grid.html` or rename it to `index.html`.
3. **nginx:** use the `server-config/nginx.conf` from build 8 or later. The earlier version had a bug that returned 404 even when the files were in place. Check that `root` is the folder that **contains** `smart-grid`, then run `sudo nginx -t && sudo systemctl reload nginx`.
4. **Upper/lower case.** Linux servers treat `Smart-Grid` and `smart-grid` as different folders. The address must match the folder name exactly.
5. **Open it in the browser directly:** `https://<portal>/smart-grid/data/grid-data.json`
   - shows `{"enc":"…`: files are fine. If the page still says "could not be loaded", check the `grid-data-url` meta line in `index.html`.
   - 404: the folder path or server rule is wrong (points 1–4).
   - 403: the files aren't readable by the web server (Linux: `chmod -R a+rX smart-grid`).
6. **IIS:** a 404.3 means the `.json` file type isn't registered. Use `server-config/iis-web.config` (it adds the type), or add MIME type `.json` → `application/json` in IIS Manager.
7. **WordPress / CMS:** a 404 from the CMS theme means the CMS is handling the address. Upload the folder by FTP or the file manager next to WordPress (not through the media library), or add an exclusion for `/smart-grid/` in the CMS's rewrite rules.

### Other problems


| Symptom | Cause / fix |
|---|---|
| "GRID data could not be loaded – HTTP 404" | `data/grid-data.json` missing or wrong path → check the folder structure / `grid-data-url` meta. |
| "…could not be loaded" + `Unexpected token <` | Server returns an HTML error page instead of JSON → add the `.json` MIME type (IIS) or fix the rewrite rule. |
| Blank page, console shows CSP error | Option A under a strict CSP → switch to Option B or allow `'unsafe-inline'` scripts. |
| Old month still showing | Browser/CDN cache → apply the `no-cache` headers; purge CDN for `*.json` and `*.html`. |
| Works on server but not from desktop double-click | Expected for Option B (`file://`); use Option A for offline viewing. |
| Fonts look different | Google Fonts blocked by network → harmless system-font fallback. |

## 9. Visitor counter

The page shows **"Total visitors: N"** at the bottom. Nothing else about visitors is recorded: no names, no activity, no reports.

**On your website (Option B):** `visitor-counter.php` and the `counter-data/` folder are already in `option-B-split/`, and `index.html` points to them.
- Needs PHP 7.4+ (any standard host). Make `counter-data/` writable by the web server (Linux: `chown www-data counter-data && chmod 750 counter-data`).
- Each browser is counted once; a cookie remembers it was counted. The same person on a phone and a PC counts twice, and clearing cookies counts again.
- The total is stored in `counter-data/count.json`. To start again from zero, delete that file. The folder is blocked from the web (`.htaccess`, `server-config/iis-web.config`, nginx block).
- No PHP? Delete the `grid-visitor-counter` value in `index.html` (leave `content=""`) and the counter line simply doesn't appear.
- Option A (single file): set `<meta name="grid-visitor-counter" content="visitor-counter.php">` in the HTML and copy `visitor-counter.php` next to it.

**On the claude.ai links:** each signed-in visitor is counted once in the page's own database. View-only and signed-out visitors can't be counted there.
