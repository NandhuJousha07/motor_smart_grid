"""Motor Smart GRID - release builder (versioned GRID, month-wise Version 1, 2, ...).

Builds BOTH deployment options from the GRID data:
  A) single-file page  -> <out>/option-A-single-file/motor-smart-grid.html
  B) split page        -> <out>/option-B-split/{index.html, assets/styles.css, assets/app.js, data/grid-data.json}
plus <out>/manifest.json.

The GRID data holds every published version: {"versions": [{id, name, label, dates, month, version,
start, end, period, note, data: {states, order, records}}, ...]}. It is written protected
(the same encoding the page decodes), never as readable JSON.

usage
  1) From the full GRID data (normal case - the data Claude builds in the Smart GRID project):
       python3 make_release.py grid-data.json <out_dir>
  2) Add a new version from a PAYOUT Grid workbook on top of the current release:
       python3 make_release.py <PAYOUT.xlsx> <out_dir> --prev <current data/grid-data.json> \
           --month "December 2026" --start 2026-12-01 --end 2026-12-31 [--note "..."] [--corrections file.json]
     The new version is numbered after the month's last version; the previous version's end
     date moves to the day before --start.
"""
import argparse, base64, datetime, json, os, re, sys
from collections import Counter
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

KEY = b'MSG-Oct26-prot'
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
          'October', 'November', 'December']


def xor(b): return bytes(x ^ KEY[i % len(KEY)] ^ ((i * 31) & 255) for i, x in enumerate(b))
def encode(obj):
    raw = json.dumps(obj, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    return {'enc': base64.b64encode(xor(raw)).decode()}
def decode(obj):
    if isinstance(obj, dict) and isinstance(obj.get('enc'), str):
        return json.loads(xor(base64.b64decode(obj['enc'])).decode('utf-8'))
    return obj


def d(s): return datetime.date.fromisoformat(s)
def ddmmyyyy(x): return x.strftime('%d-%m-%Y')
def period(a, b):
    if (a.year, a.month) == (b.year, b.month):
        return f'{a.day:02d} – {b.day:02d} {MONTHS[a.month - 1]} {a.year}'
    return f'{a.day:02d} {MONTHS[a.month - 1]} – {b.day:02d} {MONTHS[b.month - 1]} {b.year}'
def set_dates(v, start, end):
    v.update(start=start.isoformat(), end=end.isoformat(), dates=f'{ddmmyyyy(start)} to {ddmmyyyy(end)}',
             period=period(start, end))
    v['label'] = f"{v['name']} - {v['dates']}"


ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--prev'); ap.add_argument('--month'); ap.add_argument('--start'); ap.add_argument('--end')
ap.add_argument('--note', default=''); ap.add_argument('--corrections')
ap.add_argument('--template', default=os.path.join(HERE, 'template.html'))
a = ap.parse_args()

if a.src.lower().endswith(('.xlsx', '.xlsm')):
    from build import build
    if not (a.prev and a.month and a.start and a.end):
        sys.exit('A workbook needs --prev, --month, --start and --end.')
    grid = decode(json.load(open(a.prev, encoding='utf-8')))
    corr = json.load(open(a.corrections, encoding='utf-8')) if a.corrections else []
    data = build(a.src, corr)
    if not data['records']:
        sys.exit('No records built - check the workbook layout.')
    data = {k: data[k] for k in ('states', 'order', 'records')}
    start, end = d(a.start), d(a.end)
    same = [v for v in grid['versions'] if v['month'] == a.month]
    n = max([int(v['version']) for v in same] or [0]) + 1
    last = grid['versions'][-1]
    if d(last['end']) >= start:
        set_dates(last, d(last['start']), start - datetime.timedelta(days=1))
    mon = MONTHS.index(a.month.split()[0]) + 1
    v = {'id': f'{a.month.split()[1]}-{mon:02d}-v{n}', 'name': f'Smart Grid {a.month} - Version {n}',
         'month': a.month, 'version': str(n), 'note': a.note, 'data': data}
    set_dates(v, start, end)
    grid['versions'].append(v)
    source = os.path.basename(a.src)
else:
    grid = decode(json.load(open(a.src, encoding='utf-8')))
    source = os.path.basename(a.src)
if not grid.get('versions'):
    sys.exit('GRID data has no versions.')

payload = encode(grid)
OPEN = '<script id="grid-data" type="application/json">'
tpl = open(a.template, encoding='utf-8').read()
s = tpl.index(OPEN) + len(OPEN); e = tpl.index('</script>', s)

# ---- Option A: single self-contained file
pa = os.path.join(a.out, 'option-A-single-file'); os.makedirs(pa, exist_ok=True)
open(os.path.join(pa, 'motor-smart-grid.html'), 'w', encoding='utf-8').write(tpl[:s] + json.dumps(payload) + tpl[e:])

# ---- Option B: split (html + css + js + json)
pb = os.path.join(a.out, 'option-B-split')
for sub in ('assets', 'data'):
    os.makedirs(os.path.join(pb, sub), exist_ok=True)
css_s = tpl.index('<style>'); css_e = tpl.index('</style>') + len('</style>')
css = tpl[css_s + len('<style>'):css_e - len('</style>')]
data_tag_s = tpl.index(OPEN); data_tag_e = e + len('</script>')
app_s = tpl.index('<script>', data_tag_e); app_e = tpl.rindex('</script>') + len('</script>')
app = tpl[app_s + len('<script>'):app_e - len('</script>')]
head_open = "(function(){\n  var DATA = __gridDecode(document.getElementById('grid-data').textContent);"
assert head_open in app, 'template script header changed'
app = app.replace(head_open, "function startGrid(DATA){", 1)
k = app.rstrip().rfind('})();'); assert k > 0
app = app[:k] + '}\n' + r'''
/* ---- Data loader (split deployment) ---- */
(function(){
  var meta = document.querySelector('meta[name="grid-data-url"]');
  var DATA_URL = (meta && meta.content) || 'data/grid-data.json';
  var box = document.getElementById('results');
  if (box) box.innerHTML = '<div class="empty"><h3>Loading GRID…</h3></div>';
  fetch(DATA_URL, { cache: 'no-cache' })
    .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function(d){ if (box) box.innerHTML = ''; startGrid(__gridDecode(d)); })
    .catch(function(err){
      if (box) box.innerHTML = '<div class="empty"><h3>GRID data could not be loaded</h3><p>' +
        String(err.message).replace(/[<>&]/g, '') + ' — please refresh, or contact the MIS team.</p></div>';
    });
})();
'''
html = (tpl[:css_s] + '<link rel="stylesheet" href="assets/styles.css">'
        + tpl[css_e:data_tag_s] + '<script src="assets/app.js" defer></script>' + tpl[app_e:])
html = html.replace('<meta name="viewport"',
                    '<meta name="grid-data-url" content="data/grid-data.json">\n<meta name="viewport"', 1)
open(os.path.join(pb, 'index.html'), 'w', encoding='utf-8').write(html)
open(os.path.join(pb, 'assets', 'styles.css'), 'w', encoding='utf-8').write(css.strip() + '\n')
open(os.path.join(pb, 'assets', 'app.js'), 'w', encoding='utf-8').write(app.strip() + '\n')
json.dump(payload, open(os.path.join(pb, 'data', 'grid-data.json'), 'w', encoding='utf-8'), separators=(',', ':'))

# ---- manifest (current version = the one applying on its start date, i.e. the last one)
cur = grid['versions'][-1]; recs = cur['data']['records']
man = dict(product='Motor Smart GRID', version=f"{cur['month']} - Version {cur['version']}",
           period=cur['period'], publishedMonth=cur['month'], revisionNote=cur.get('note', ''),
           source=source,
           versions=[dict(name=v['name'], dates=v['dates'], rates=len(v['data']['records']) if 'data' in v else None)
                     for v in grid['versions']],
           builtAt=datetime.datetime.now().astimezone().isoformat(timespec='seconds'),
           states=[x['code'] for x in cur['data']['states']], totalRates=len(recs),
           ratesByState=dict(Counter(r['state'] for r in recs)),
           insurers=len({r['company'] for r in recs}),
           changeLabels=dict(Counter({'up': 'Increased', 'down': 'Decreased', 'mixed': 'Mixed', 'new': 'Newly added GRID'}[r['chg']]
                                     for r in recs if r.get('chg'))))
json.dump(man, open(os.path.join(a.out, 'manifest.json'), 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print(json.dumps(man, indent=2, ensure_ascii=False))
