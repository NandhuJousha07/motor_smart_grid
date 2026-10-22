# Motor Smart GRID – Deployment Guide

**Release:** October 2026 – Version 2 (prepared 21-10-2026)
**Contains:** October 2026 Version 1 (06-10-2026 to 21-10-2026) and Version 2 (22-10-2026 to 31-10-2026)

---

## 1. What is in this kit

```
motor-smart-grid/
├── motor-smart-grid.html          Page (open this URL)
├── css/motor-smart-grid.css       Styles
├── js/motor-smart-grid.js         Page script (filters, ranking, version bar, protection, visitor line)
├── fonts/
│   ├── atkinson-hyperlegible-400.woff2
│   └── atkinson-hyperlegible-700.woff2
├── data/
│   ├── versions.json              List of GRID versions (month, version no., dates, data file)
│   ├── grid-2026-10-v1.json       Rates – October 2026 Version 1
│   └── grid-2026-10-v2.json       Rates – October 2026 Version 2
├── visitor-counter.php            "Today's visitors / Total visitors" counter (PHP 7.4+)
├── counter-data/                  Counter storage – must be writable by the web server
│   └── .htaccess                  Blocks direct access to the counts
├── .htaccess                      Apache settings (MIME types, no-cache for data, no directory listing)
└── DEPLOYMENT_GUIDE.md            This file (not needed on the server)
```

The data files are **encoded** (not readable JSON). The page decodes them in the browser. Do not edit them by hand – new files are supplied by the MIS team for each GRID update.

## 2. Requirements

- Any web server (Apache, Nginx, IIS) serving the folder over **http(s)**.
  The page loads its data with `fetch()`, so it will **not** work by double-clicking the HTML file (`file://`).
- PHP 7.4 or newer for the visitor counter. Without PHP the GRID still works; only the visitor line stays hidden.
- No database, no build step, no Node/Java runtime.

## 3. First-time deployment

1. Upload the whole `motor-smart-grid/` folder to the website, keeping the folder structure exactly as above
   (e.g. `https://<your-site>/motor-smart-grid/`).
2. Make `counter-data/` writable by the web-server user:
   - Linux: `chown www-data:www-data counter-data && chmod 775 counter-data` (use your server's web user, e.g. `apache`, `nginx`).
   - Windows/IIS: give the IIS application-pool identity *Modify* rights on `counter-data`.
3. Open `https://<your-site>/motor-smart-grid/motor-smart-grid.html`.
4. Open `https://<your-site>/motor-smart-grid/visitor-counter.php?check=1` – it should show `"ok": true`.
5. Put the page behind your portal login if it should be internal only (recommended – see section 8).

The page can be renamed to `index.html` if you want the folder URL to open it directly; nothing else refers to its name.

## 4. Updating for a new GRID version (monthly / mid-month)

Each update from the MIS team comes as a new kit. To deploy it:

1. Replace the `data/` folder (all files) – `versions.json` lists every version and points to its data file.
2. Replace `motor-smart-grid.html`, `css/` and `js/` **only if they are included in the update**.
3. **Do not** replace or delete `counter-data/` – it holds the visitor history.
4. Hard-refresh the page (Ctrl + F5) and check the version bar shows the new version.

For this release (October Version 2): replace `data/`, `motor-smart-grid.html`, `css/` and `js/`. Keep `counter-data/`. `visitor-counter.php` is included; replacing it is safe.

## 5. How versions behave

- The version bar (below the filters) lists the month's versions: **Applies today**, **Earlier**, or **Upcoming**.
- Dates are checked in India time (IST). On opening, the page shows the version that applies today.
- Upcoming versions are listed (marked *Upcoming*) so they can be checked before they start.
- The filters at the top stay as chosen when switching versions.

Version 2 becomes *Applies today* automatically on 22-10-2026 – no action is needed on that day.

## 6. Server configuration notes

**Apache** – the included `.htaccess` handles everything (needs `AllowOverride All` or at least `FileInfo Indexes AuthConfig`).

**Nginx** – add to the site config:

```nginx
location /motor-smart-grid/ {
    autoindex off;
    add_header X-Robots-Tag "noindex, nofollow, noarchive";
    location ~ \.(json|html|js|css)$ { add_header Cache-Control "no-cache"; }
    location ~ \.md$ { deny all; }
    location /motor-smart-grid/counter-data/ { deny all; }
    location ~ \.php$ { include fastcgi_params; fastcgi_pass unix:/run/php/php-fpm.sock;
                        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; }
}
types { font/woff2 woff2; application/json json; }
```

**IIS** – add MIME types `.woff2 → font/woff2` and `.json → application/json` if missing, deny requests to `counter-data/`, and set `Cache-Control: no-cache` for `.json` files.

## 7. Settings inside the page

| Setting | Where | Default |
|---|---|---|
| Visitor counter URL | `<meta name="grid-visitor-counter" content="visitor-counter.php">` in `motor-smart-grid.html` | `visitor-counter.php` (same folder) |
| Data location | `data/versions.json` (relative to the page) in `js/motor-smart-grid.js` | `data/` |

If the counter is placed elsewhere, change the meta `content` to its URL (same domain).

## 8. Protection

The page blocks right-click, copy/select, view-source/save/print shortcuts and hides the GRID while developer tools are open, and the rate data is shipped encoded. These are deterrents against casual copying only – anything a browser shows can be captured by a determined user. For real access control, keep the folder behind the portal login.

## 9. Visitor counter – troubleshooting

The footer line "Today's visitors: N · Total visitors: N" appears only when the counter answers correctly. If it is missing, open the browser console (browser menu → More tools → Developer tools, since F12 is blocked on the page) and look for a `[Smart GRID] Visitor counter:` message, then open `visitor-counter.php?check=1`.

| Symptom | Cause | Fix |
|---|---|---|
| HTTP 404 | `visitor-counter.php` not uploaded next to the page | Upload it to the same folder (or fix the meta URL) |
| HTTP 405 / 501, or "did not return JSON" | PHP is not running for this file | Enable PHP for the folder / check the handler |
| HTTP 500, `counter_data_writable: false` | `counter-data/` missing or not writable | Create it and give the web-server user write access (section 3) |
| Counts never increase for a user | Browser blocks cookies | Expected – that browser counts once per day only if cookies are allowed |

How counting works: one visit = one browser per IST day. A cookie holding only today's date prevents repeat counts the same day. Counts are stored in `counter-data/visitors.json` (`total` and a per-day history for the last 400 days). No personal data is stored.

To reset the counter: delete `counter-data/visitors.json` (it is recreated on the next visit).

## 10. Release checklist

- [ ] Whole folder uploaded with structure intact
- [ ] `counter-data/` writable; `visitor-counter.php?check=1` shows `"ok": true`
- [ ] Page opens over https and shows "October 2026", Version 1 *Applies today* (until 21-10-2026) and Version 2 *Upcoming*
- [ ] Clicking Version 2 shows Tamil Nadu – PCV School Bus with TATA AIG at 61.00 / 61.00 (above 12 seats, all TN RTOs)
- [ ] Footer shows the visitor line
- [ ] Page is behind the portal login (if required)

## Release notes – October 2026 Version 2 (from 22-10-2026)

1. TATA AIG – School Bus: 61% Package / 61% TP for above 12 seats, all TN RTOs (replaces the earlier 58% / 56% / 53% TN rates).
2. National – complete GRID revised for Tamil Nadu, Kerala, Karnataka and Andhra Pradesh & Telangana.
3. Kshema – Two-Wheeler added for Kerala (Bundle 1+5, Package 1+1, SAOD), with remark: CPA mandatory - without CPA: 2.5% payout deduction; TPPD Discount = Yes: 2.5% payout deduction.
4. Version 1 now runs 06-10-2026 to 21-10-2026.
5. Declined remarks are shown in static red (no blinking).
