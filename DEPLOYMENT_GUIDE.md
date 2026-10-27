# Deployment Guide — Motor Smart GRID

## 1. Before you start

1. Verify the files: `sha256sum -c checksums.sha256` (Linux/macOS) or `Get-FileHash` in PowerShell — all lines must say OK.
2. Read `manifest.json` and confirm the versions listed (now: **October 2026 Version 1, 06-10-2026 to 21-10-2026** and **October 2026 Version 2, 22-10-2026 to 25-10-2026** and **October 2026 Version 3, 26-10-2026 to 31-10-2026**).
3. Pick a URL, e.g. `https://<your-portal>/smart-grid/`.

## 2. Website folder `smart-grid/` (recommended)

1. Copy the `smart-grid/` folder to the web root, keeping its structure:
   ```
   /smart-grid/
     index.html
     assets/styles.css
     assets/app.js
     data/versions.json          list of versions
     data/2026-10-v1.json        rates of each version (one file per version)
     data/2026-10-v2.json
     data/2026-10-v3.json
     api/visitor-counter.js      visitor counter on Vercel
     vercel.json                 Vercel headers (no-cache for rates, security headers)
     .vercelignore               keeps the PHP counter out of Vercel deployments
     visitor-counter.php         visitor counter on PHP hosting
     counter-data/.htaccess
   ```
2. Apply the matching server config from `server-config/` (nginx block, `.htaccess`, or `web.config`). The important parts:
   - `data/*.json` and `*.html` served with `Cache-Control: no-cache` so users never see old rates.
   - JSON served as `application/json` (IIS needs the MIME mapping in `web.config`).
   - gzip/compression on — each version file is ~2.5 MB raw, much smaller compressed.
3. Open `https://<your-portal>/smart-grid/` and run `UAT_CHECKLIST.md`.

**Data in a different location?** Edit one line in `index.html`:
`<meta name="grid-data-url" content="data/versions.json">`. The version files are read from the same folder as `versions.json`. A cross-domain URL needs CORS on that server.

## 2a. Deploying on Vercel

Vercel serves static files and runs JavaScript functions, but not PHP — so on Vercel the visitor counter runs as the function `api/visitor-counter.js`, with its counts kept in a free Redis database from the Vercel Marketplace.

**One-time setup (about 5 minutes):**
1. Deploy the **`smart-grid/`** folder as the Vercel project (set it as the project's *Root Directory* if it sits inside a Git repository; framework preset **Other**, no build command, no output directory). `vercel.json`, `api/` and `.vercelignore` must be in that folder — they already are.
2. In the Vercel project open **Storage → Create Database → Upstash for Redis** (Marketplace, free plan) and **connect it to this project** for Production (and Preview if you test there). This adds the environment variables `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
3. **Redeploy** the project (environment variables are read only by new deployments).
4. Open **`https://<your-site>/api/visitor-counter?check=1`** — it must show `"result": "OK - the counter can work"`. Then open the GRID: the bottom line shows *Today's visitors: 1 · Total visitors: 1*.

**Optional environment variables** (Project → Settings → Environment Variables):
| Name | Use |
|---|---|
| `SG_START_TOTAL` | A number added to the total — e.g. the visits counted earlier on another server |
| `SG_COUNTER_PREFIX` | Key prefix in Redis (default `motor-smart-grid`) — set a different one if two sites share the database |

**Monthly updates on Vercel:** replace `index.html`, `assets/` and `data/` as usual (or the whole folder) and redeploy. The counts live in Redis, so redeploying never resets them.

**Single file on Vercel:** deploy `single-file/` instead — it has its own `api/`, `vercel.json` (opens `motor-smart-grid.html` at `/`) and `.vercelignore`. Connect the database the same way.

**Vercel checks:** `vercel.json` sends `no-cache` for the page and `data/`, 1 hour cache for `assets/`, and the same security headers as `server-config/` (Content-Security-Policy, nosniff, noindex). Vercel compresses responses automatically. For access control use Vercel Deployment Protection (Password / Vercel Authentication) or put the site behind your portal login.

## 3. Single file (fallback)

1. Upload `single-file/motor-smart-grid.html` to the portal (any name, any folder). Every version is inside it.
2. If the portal sends a Content-Security-Policy, it must allow inline script: `script-src 'self' 'unsafe-inline'`. If that's not allowed, use the website folder.
3. Serve it with `Cache-Control: no-cache` (configs in `server-config/` cover `.html`).
4. The file grows by about 2.5 MB with every version. Once there are more than a few versions, switch to the website folder, which loads a version only when it is opened.

## 4. Putting it in the portal

- **Menu link (simplest, best on mobile):** link to `/smart-grid/index.html`. The page opens the version that applies today (India time); the version bar switches to any other version.
- **Inside a portal page:** use `embed/portal-embed-snippet.html` (iframe). Host the GRID on the same domain; the provided CSP uses `frame-ancestors 'self'`, so if the portal page is on another domain, add it there (e.g. `frame-ancestors 'self' https://portal.example.com`).
- The page has its own sticky filter bar and mobile layout — give the iframe the full content width and at least ~640 px height.

## 5. Security notes

**Built-in data protection.** The rate data is shipped encoded (`{"enc": "..."}`), not as readable JSON. The page blocks right-click, inspect / view-source / save / print shortcuts, copying and text selection, and hides the GRID while developer tools are open. These measures stop casual copying only; anyone with the link and enough skill can still get the data. **The only real protection is access control:** serve `/smart-grid/` only to logged-in portal users (portal session check, or server-level authentication such as nginx `auth_request` / `auth_basic`, Apache `Require valid-user`, or IIS Windows/Forms authentication). Never publish it at a public, unauthenticated URL.

The encoding key is `GRID_KEY` in `monthly-update/make_site.py` and `__GRID_KEY` in `monthly-update/template.html`. If you change it, change it in both places.


- Static, read-only page: no forms, no login, no data sent anywhere except the visitor counter (`/api/visitor-counter` on Vercel or `visitor-counter.php` on PHP hosting; one cookie `sg_day`). It does not call any external API.
- It stores nothing in the viewer's browser: every open or refresh starts with cleared filters.
- the website folder works under a strict CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'`.
  (`'unsafe-inline'` in style-src is needed for small inline table/highlight styles.)
- The body font (Atkinson Hyperlegible) is embedded in the page, so the CSP must allow `font-src data:` (the configs in `server-config/` do). Only the heading font comes from Google Fonts; to drop Google Fonts, delete the three `fonts.googleapis.com / fonts.gstatic.com` `<link>` lines and headings use Georgia.
- Contains commission rates — place it behind portal login if it should not be public.

## 6. New version or new month

Every version is one entry in `monthly-update/versions.json`. To add one (a mid-month revision or a new month's workbook):

1. Put the workbook in `source/`. If rates were revised after it was issued, create a corrections file in `monthly-update/` (see `monthly-update/README.md`). For a Version 2 of the same month, copy the Version 1 corrections file and add the new change.
2. Add an entry to `versions.json`:
   ```json
   {"id": "2026-11-v1", "month": "November 2026", "version": "1",
    "start": "2026-11-01", "end": "2026-11-30",
    "source": "source/From_1st_To_30th_Nov_PAYOUT_Grid_2026.xlsx",
    "corrections": "monthly-update/corrections_Nov2026_v1.json",
    "changes": "November GRID"}
   ```
   `end` is the last day the workbook covers. You never edit the previous version's dates: each version automatically ends the day before the next one starts (e.g. a Version 2 starting 20-10-2026 makes Version 1 end 19-10-2026).
3. Build:
   ```bash
   pip install -r monthly-update/requirements.txt     # once (openpyxl)
   python3 monthly-update/make_site.py .
   ```
   It prints each version with its dates and rate counts. Compare with the previous version before publishing.
4. Upload `index.html`, `assets/` and `data/` from `smart-grid/` (or `single-file/motor-smart-grid.html`). Keep the old version files in `data/`: the version bar still offers them.

## 7. Rollback

Keep the previous release folder. To roll back, restore the previous `index.html`, `assets/` and `data/` (website folder) or the previous HTML file (single file). To withdraw only the newest version, remove its entry from `versions.json`, run `make_site.py` again and upload; the previous version's end date goes back to the end of its month. The masthead and the bottom-right badge show the open version and its dates.

## 8. Troubleshooting

### "Page not found" / 404

Work through these in order. Most deployments fail on 1 or 2.

1. **Wrong folder level.** The server folder must contain the files **directly**:
   ```
   smart-grid/index.html          <- correct
   smart-grid/smart-grid/index.html                        <- wrong (one level too deep)
   smart-grid/Motor-Smart-GRID-Deploy-Kit_.../...          <- wrong (whole kit uploaded)
   ```
   Copy the kit's `smart-grid/` folder itself into the web root, not the whole kit and not the zip.
2. **the single file file name.** The single file is called `motor-smart-grid.html`. Either open `/smart-grid/motor-smart-grid.html` or rename it to `index.html`.
3. **nginx:** use the `server-config/nginx.conf` from this kit (an older copy had a bug that returned 404 even when the files were in place). Check that `root` is the folder that **contains** `smart-grid`, then run `sudo nginx -t && sudo systemctl reload nginx`.
4. **Upper/lower case.** Linux servers treat `Smart-Grid` and `smart-grid` as different folders. The address must match the folder name exactly.
5. **Open it in the browser directly:** `https://<portal>/smart-grid/data/versions.json`
   - shows `{"enc":"…`: files are fine. If the page still says "could not be loaded", check the `grid-data-url` meta line in `index.html`.
   - 404: the folder path or server rule is wrong (points 1–4).
   - 403: the files aren't readable by the web server (Linux: `chmod -R a+rX smart-grid`).
6. **IIS:** a 404.3 means the `.json` file type isn't registered. Use `server-config/iis-web.config` (it adds the type), or add MIME type `.json` → `application/json` in IIS Manager.
7. **WordPress / CMS:** a 404 from the CMS theme means the CMS is handling the address. Upload the folder by FTP or the file manager next to WordPress (not through the media library), or add an exclusion for `/smart-grid/` in the CMS's rewrite rules.

### Other problems


| Symptom | Cause / fix |
|---|---|
| "GRID data could not be loaded – HTTP 404" | `data/versions.json` or that version's `data/<id>.json` is missing → upload the whole `data/` folder / check the `grid-data-url` meta. |
| "…could not be loaded" + `Unexpected token <` | Server returns an HTML error page instead of JSON → add the `.json` MIME type (IIS) or fix the rewrite rule. |
| Blank page, console shows CSP error | the single file under a strict CSP → switch to the website folder or allow `'unsafe-inline'` scripts. |
| Old month still showing | Browser/CDN cache → apply the `no-cache` headers; purge CDN for `*.json` and `*.html`. |
| Works on server but not from desktop double-click | Expected for the website folder (`file://`); use the single file for offline viewing. |
| Fonts look different | Google Fonts blocked by network → harmless system-font fallback. |

## 9. Visitor counter

The page shows **"Today's visitors: N · Total visitors: N"** at the bottom.

**What counts as a visit:** one browser on one day (India time). Opening or reloading the GRID again the same day doesn't add; opening it again on a later day counts as a new visit. "Today's visitors" resets at midnight India time; "Total visitors" adds up every day's visits. Nothing else about visitors is recorded: no names, no activity, no reports.

**Where the counter runs:** the page asks `/api/visitor-counter` first (Vercel) and then `visitor-counter.php` (PHP hosting) — `<meta name="grid-visitor-counter" content="/api/visitor-counter visitor-counter.php">` in `index.html`. Whichever answers is used; if neither does, the line is hidden and everything else works.
- A cookie (`sg_day`) remembers the day a browser was last counted and expires at midnight India time. The same person on a phone and a PC counts twice that day.

**On Vercel (`api/visitor-counter.js`):** set up as in section 2a. Counts are kept in the connected Upstash Redis database: `motor-smart-grid:total` and `motor-smart-grid:day:YYYY-MM-DD` (each day kept 400 days). To start again from zero, delete those keys in the Upstash console (Data Browser).

**On PHP hosting (`visitor-counter.php`):** `visitor-counter.php` and the `counter-data/` folder are already in `smart-grid/`.
- Needs PHP 7.4+. Make `counter-data/` writable by the web server (Linux: `chown www-data counter-data && chmod 750 counter-data`).
- Totals are stored in `counter-data/count.json` as `{"total": N, "days": {"2026-10-13": n, ...}}`. A total from the earlier counter (`{"visitors": N}`) is kept as the starting total. To start again from zero, delete the file. The folder is blocked from the web (`.htaccess`, `server-config/iis-web.config`, nginx block).
- Single file: `single-file/` already contains both counters; upload them next to `motor-smart-grid.html`.

### Visitor count not showing on the website

**On Vercel:** open **`https://<your-site>/api/visitor-counter?check=1`**:

   | What you see | Meaning | Fix |
   |---|---|---|
   | `"result": "OK - the counter can work"` | Counter is fine | Clear the browser cache and reload the GRID |
   | `"result": "FIX - connect an Upstash for Redis database…"` | No database connected, or not redeployed after connecting | Storage → connect Upstash for Redis to the project → Redeploy |
   | `"result": "FIX - the Redis database did not answer…"` | Wrong / old `KV_REST_API_URL` or `KV_REST_API_TOKEN` | Reconnect the database (Storage tab) and redeploy |
   | 404 Not Found | `api/visitor-counter.js` is not in the deployed folder, or the project's Root Directory is not `smart-grid/` | Deploy the whole `smart-grid/` folder including `api/` |

**On PHP hosting:**

1. Open **`https://<your-portal>/smart-grid/visitor-counter.php?check=1`** in a browser:

   | What you see | Meaning | Fix |
   |---|---|---|
   | JSON with `"result": "OK - the counter can work"` | Counter is fine | Clear the browser cache (old `index.html`/`assets/app.js` may be cached) and reload the GRID |
   | JSON with `"result": "FIX - make counter-data/ writable…"` | PHP runs but can't save the count | `chown www-data smart-grid/counter-data && chmod 750 smart-grid/counter-data` (use the web server's user) |
   | The PHP code itself, or the file downloads | PHP isn't running for this folder | Enable PHP for `/smart-grid/` (nginx: add the `visitor-counter.php` block from `server-config/nginx.conf`; IIS: install PHP via FastCGI) |
   | 404 Not Found | `visitor-counter.php` wasn't uploaded next to the page | Upload it (and `counter-data/`) into the same folder as `index.html` |
   | 405 / 501 | The server doesn't run PHP (static hosting) | On Vercel use `api/visitor-counter.js` (section 2a); otherwise host `/smart-grid/` on a server with PHP |

2. The page also explains the problem in the browser console (open developer tools from the browser menu; F12 is blocked on the page): look for a message starting **`[Smart GRID] Visitor counter:`**.
3. Check that the deployed `index.html` contains `<meta name="grid-visitor-counter" content="/api/visitor-counter visitor-counter.php">`.

**On the claude.ai links:** each signed-in visitor keeps one record in the page's own database (last visit date and number of visit days), counted once per day the same way. View-only and signed-out visitors can't be counted there.
