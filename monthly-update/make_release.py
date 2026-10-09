"""Motor Smart GRID - monthly release builder.

Builds BOTH deployment options from an insurer PAYOUT Grid workbook:
  A) single-file page  -> <out>/option-A-single-file/motor-smart-grid.html
  B) split page        -> <out>/option-B-split/{index.html, assets/styles.css, assets/app.js, data/grid-data.json}

usage:
  python3 make_release.py <PAYOUT.xlsx> <out_dir> --period "06 – 31 October 2026" \
        --month "October 2026" --version 1.0 [--note "revision note"]
"""
import argparse, json, os, re, sys, datetime
from collections import Counter
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from build import build

ap = argparse.ArgumentParser()
ap.add_argument('xlsx'); ap.add_argument('out')
ap.add_argument('--period', required=True); ap.add_argument('--month', required=True)
ap.add_argument('--version', required=True); ap.add_argument('--note', default='')
ap.add_argument('--template', default=os.path.join(HERE, 'template.html'))
ap.add_argument('--corrections', default=None, help='JSON file of manual row corrections')
ap.add_argument('--visitor-counter', default='visitor-counter.php', help='Option B: URL of the visitor counter (empty = no counter)')
a = ap.parse_args()

corr = json.load(open(a.corrections, encoding='utf-8')) if a.corrections else []
data = build(a.xlsx, corr)
data.update(periodDisplay=a.period, publishedMonth=a.month, version=a.version, revisionNote=a.note)
if not data['records']:
    sys.exit('No records built - check the workbook layout.')

OPEN = '<script id="grid-data" type="application/json">'
tpl = open(a.template, encoding='utf-8').read()
tpl = re.sub(r'(<div class="place" id="place-text">)[^<]*(</div>)',
             lambda m: m.group(1) + a.period + m.group(2), tpl)
tpl = re.sub(r"DATA\.periodDisplay \|\| '[^']*'",
             lambda m: "DATA.periodDisplay || '" + a.period + "'", tpl)
s = tpl.index(OPEN) + len(OPEN); e = tpl.index('</script>', s)

# ---- encode the rate data (not readable as plain JSON in page source / network tab)
import base64
GRID_KEY = 'MSG-Oct26-prot'   # must match __GRID_KEY in template.html
def encode_grid(d):
    raw = bytearray(json.dumps(d, ensure_ascii=False, separators=(',', ':')).encode('utf-8'))
    k = GRID_KEY.encode()
    for i in range(len(raw)):
        raw[i] ^= k[i % len(k)] ^ ((i * 31) & 255)
    return {'enc': base64.b64encode(bytes(raw)).decode('ascii')}
enc_data = encode_grid(data)

# ---- Option A: single self-contained file
js = json.dumps(enc_data, separators=(',', ':'))
pa = os.path.join(a.out, 'option-A-single-file'); os.makedirs(pa, exist_ok=True)
open(os.path.join(pa, 'motor-smart-grid.html'), 'w', encoding='utf-8').write(tpl[:s] + js + tpl[e:])

# ---- Option B: split (html + css + js + json)
pb = os.path.join(a.out, 'option-B-split')
for d in ('assets', 'data'):
    os.makedirs(os.path.join(pb, d), exist_ok=True)
css_s = tpl.index('<style>'); css_e = tpl.index('</style>') + len('</style>')
css = tpl[css_s + len('<style>'):css_e - len('</style>')]
data_tag_s = tpl.index(OPEN); data_tag_e = e + len('</script>')
app_s = tpl.index('<script>', data_tag_e); app_e = tpl.index('</script>', app_s) + len('</script>')
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
        + tpl[css_e:data_tag_s] + tpl[data_tag_e:app_s]
        + '<script src="assets/app.js" defer></script>' + tpl[app_e:])
html = html.replace('<meta name="viewport"',
                    '<meta name="grid-data-url" content="data/grid-data.json">\n<meta name="viewport"', 1)
html = html.replace('<meta name="grid-visitor-counter" content="">', '<meta name="grid-visitor-counter" content="' + a.visitor_counter + '">', 1)
if a.visitor_counter:
    import shutil
    src = os.path.join(HERE, 'counter', 'visitor-counter.php')
    if os.path.exists(src):
        shutil.copy(src, os.path.join(pb, 'visitor-counter.php'))
        os.makedirs(os.path.join(pb, 'counter-data'), exist_ok=True)
        open(os.path.join(pb, 'counter-data', '.htaccess'), 'w').write('Require all denied\nDeny from all\n')
open(os.path.join(pb, 'index.html'), 'w', encoding='utf-8').write(html)
open(os.path.join(pb, 'assets', 'styles.css'), 'w', encoding='utf-8').write(css.strip() + '\n')
open(os.path.join(pb, 'assets', 'app.js'), 'w', encoding='utf-8').write(app.strip() + '\n')
json.dump(enc_data, open(os.path.join(pb, 'data', 'grid-data.json'), 'w', encoding='utf-8'), separators=(',', ':'))

# ---- manifest
man = dict(product='Motor Smart GRID', version=a.version, period=a.period, publishedMonth=a.month,
           revisionNote=a.note, sourceWorkbook=os.path.basename(a.xlsx),
           corrections=[dict(sheet=c['sheet'], row=c['row'], note=c.get('note', '')) for c in corr],
           builtAt=datetime.datetime.now().astimezone().isoformat(timespec='seconds'),
           states=[x['code'] for x in data['states']], totalRates=len(data['records']),
           ratesByState=dict(Counter(r['state'] for r in data['records'])))
json.dump(man, open(os.path.join(a.out, 'manifest.json'), 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print(json.dumps(man, indent=2, ensure_ascii=False))
