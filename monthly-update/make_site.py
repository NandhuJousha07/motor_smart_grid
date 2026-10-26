"""Motor Smart GRID - builds the GRID page with every version in it.

One page. The filters sit at the top; below them a month-wise version bar
(October 2026: Version 1, Version 2 ...). Opening a version shows its rates with the
same filters applied. The version that applies today (India time) opens first.

Versions are listed in monthly-update/versions.json (paths relative to the kit folder):
  [{"id": "2026-10-v1", "month": "October 2026", "version": "1",
    "start": "2026-10-06", "end": "2026-10-31",
    "source": "source/<PAYOUT>.xlsx", "corrections": "monthly-update/corrections_Oct2026_v1.json",
    "supplements": ["source/<extra rows>.xlsx",    (optional: extra GRID rows sent separately)
                    {"file": "source/<insurer GRID>.xlsx", "replaces": ["National"]}],  (insurer's complete new GRID)
    "remark_add": [{"company": "Kshema", "state": "KL", "block": "TW", "text": "..."}],  (optional)
    "note": "", "changes": "what changed (for the release notes / manifest)"}, ...]

"end" is the last day the workbook covers. Each version ends the day before the next
version starts, so adding Version 2 automatically shortens Version 1.

usage:  python3 monthly-update/make_site.py <kit_dir>
output: <kit>/single-file/motor-smart-grid.html   one file, every version inside
        <kit>/smart-grid/  index.html, assets/{styles.css,app.js},
                               data/versions.json + data/<id>.json (one per version, loaded when opened),
                               visitor-counter.php, counter-data/
        <kit>/manifest.json
"""
import base64, datetime, json, os, re, shutil, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from build import build
from compare import compare_with_previous, compare_with_corrections

KIT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..'))
VERS = json.load(open(os.path.join(HERE, 'versions.json'), encoding='utf-8'))

GRID_KEY = 'MSG-Oct26-prot'   # must match __GRID_KEY in template.html
def encode(d):
    raw = bytearray(json.dumps(d, ensure_ascii=False, separators=(',', ':')).encode('utf-8'))
    k = GRID_KEY.encode()
    for i in range(len(raw)):
        raw[i] ^= k[i % len(k)] ^ ((i * 31) & 255)
    return {'enc': base64.b64encode(bytes(raw)).decode('ascii')}

D = datetime.date.fromisoformat
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
          'September', 'October', 'November', 'December']
def dmy(d): return d.strftime('%d-%m-%Y')
def period(s, e):
    if (s.year, s.month) == (e.year, e.month):
        return '%02d – %02d %s %d' % (s.day, e.day, MONTHS[s.month - 1], e.year)
    return '%02d %s – %02d %s %d' % (s.day, MONTHS[s.month - 1][:3], e.day, MONTHS[e.month - 1][:3], e.year)

# ---- dates: each version ends the day before the next one starts
VERS.sort(key=lambda v: v['start'])
assert len({v['id'] for v in VERS}) == len(VERS), 'duplicate version id in versions.json'
for i, v in enumerate(VERS):
    s, e = D(v['start']), D(v['end'])
    if i + 1 < len(VERS):
        e = min(e, D(VERS[i + 1]['start']) - datetime.timedelta(days=1))
    if e < s:
        sys.exit('Version %s would end before it starts - check the start dates in versions.json' % v['id'])
    v['_s'], v['_e'] = s, e

# ---- build every version's rates
catalog, manifest_versions, payloads = [], [], {}
for v in VERS:
    corr = json.load(open(os.path.join(KIT, v['corrections']), encoding='utf-8')) if v.get('corrections') else []
    sup = [dict(x, file=os.path.join(KIT, x['file'])) if isinstance(x, dict) else os.path.join(KIT, x)
           for x in v.get('supplements', [])]
    data = build(os.path.join(KIT, v['source']), corr, sup, v.get('remark_add'))
    if not data['records']:
        sys.exit('No records built for %s - check the workbook layout.' % v['id'])
    name = 'Smart Grid %s - Version %s' % (v['month'], v['version'])
    dates = '%s to %s' % (dmy(v['_s']), dmy(v['_e']))
    meta = dict(id=v['id'], name=name, label='%s - %s' % (name, dates), dates=dates,
                month=v['month'], version=v['version'], start=v['_s'].isoformat(), end=v['_e'].isoformat(),
                period=period(v['_s'], v['_e']), note=v.get('note', ''))
    # Increased / Decreased labels (see compare.py). The first version of a month: rates a
    # correction changed (against the workbook value) and rates from supplement workbooks (New).
    # A later version of the same month: every rate that is new or different from the month's
    # first version, compared with the matching rate there.
    # later versions of a month are compared with the month's FIRST version, so every change
    # made during the month keeps its label (Version 3 still shows what changed in Version 2)
    prev = next((mv for mv in manifest_versions if mv['month'] == v['month']), None)
    if prev:
        RK = lambda r: (r['state'], r['sec'], r['company'], r['segment'], r['package'], r['tp'], r['remarks'])
        before = {RK(r) for r in payloads[prev['id']]['records']}
        for r in data['records']:
            r.pop('rev', None); r.pop('_prevs', None)
            if RK(r) not in before: r['rev'] = v['version']
        compare_with_previous(data['records'], payloads[prev['id']]['records'])
    else:
        for r in data['records']:
            if r.get('rev'): r['rev'] = v['version']
            else: r.pop('rev', None)
        compare_with_corrections(data['records'])
    for r in data['records']:        # only value changes and new rates carry a label
        if r.get('chg') in (None, 'same'):
            r.pop('chg', None); r.pop('rev', None); r.pop('was', None); r.pop('dup', None); r.pop('ddn', None)
    catalog.append(meta)
    payloads[v['id']] = data
    manifest_versions.append(dict(meta, source=v['source'], supplements=v.get('supplements', []), corrections=v.get('corrections', ''),
                                  changes=v.get('changes', ''), totalRates=len(data['records']),
                                  ratesByState=dict(Counter(r['state'] for r in data['records'])),
                                  correctionsApplied=[dict(sheet=c['sheet'], row=c['row'], note=c.get('note', '')) for c in corr],
                                  remarkAdded=v.get('remark_add', []),
                                  ratesLabelled=dict(Counter({'up': 'increased', 'down': 'decreased', 'mixed': 'increased & decreased', 'new': 'new'}[r['chg']]
                                                             for r in data['records'] if r.get('chg')))))

# ---- page template
today = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=330)).date().isoformat()
first = ([c for c in catalog if c['start'] <= today <= c['end']] or [c for c in catalog if c['end'] < today] or catalog[:1])[-1]
tpl = open(os.path.join(HERE, 'template.html'), encoding='utf-8').read()
tpl = re.sub(r'(<div class="place" id="place-text">)[^<]*(</div>)', lambda m: m.group(1) + first['period'] + m.group(2), tpl)
OPEN = '<script id="grid-data" type="application/json">'
s = tpl.index(OPEN) + len(OPEN); e = tpl.index('</script>', s)

outA = os.path.join(KIT, 'single-file')
outB = os.path.join(KIT, 'smart-grid')
for d in (outA, outB):
    if os.path.isdir(d):
        shutil.rmtree(d)
    os.makedirs(d)

# ---- Option A: one file, all versions inline
full = encode({'versions': [dict(c, data=payloads[c['id']]) for c in catalog]})
open(os.path.join(outA, 'motor-smart-grid.html'), 'w', encoding='utf-8').write(
    tpl[:s] + json.dumps(full, separators=(',', ':')) + tpl[e:])

# ---- Option B: page + assets + one data file per version
for d in ('assets', 'data'):
    os.makedirs(os.path.join(outB, d))
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
/* ---- Loader (split deployment): the version list, then each version's rates when opened ---- */
(function(){
  var meta = document.querySelector('meta[name="grid-data-url"]');
  var DATA_URL = (meta && meta.content) || 'data/versions.json';
  var base = DATA_URL.replace(/[^\/]*$/, '');
  var box = document.getElementById('results');
  if (box) box.innerHTML = '<div class="empty"><h3>Loading GRID…</h3></div>';
  fetch(DATA_URL, { cache: 'no-cache' })
    .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function(d){
      var cat = __gridDecode(d);
      (cat.versions || []).forEach(function(v){ if (v.file && !/^(\/|https?:)/.test(v.file)) v.file = base + v.file; });
      if (box) box.innerHTML = '';
      startGrid(cat);
    })
    .catch(function(err){
      if (box) box.innerHTML = '<div class="empty"><h3>GRID data could not be loaded</h3><p>' +
        String(err.message).replace(/[<>&]/g, '') + ' — please refresh, or contact the MIS team.</p></div>';
    });
})();
'''
html = (tpl[:css_s] + '<link rel="stylesheet" href="assets/styles.css">'
        + tpl[css_e:data_tag_s] + tpl[data_tag_e:app_s]
        + '<script src="assets/app.js" defer></script>' + tpl[app_e:])
html = html.replace('<meta name="viewport"', '<meta name="grid-data-url" content="data/versions.json">\n<meta name="viewport"', 1)
open(os.path.join(outB, 'index.html'), 'w', encoding='utf-8').write(html)
open(os.path.join(outB, 'assets', 'styles.css'), 'w', encoding='utf-8').write(css.strip() + '\n')
open(os.path.join(outB, 'assets', 'app.js'), 'w', encoding='utf-8').write(app.strip() + '\n')
json.dump(encode({'versions': [dict(c, file=c['id'] + '.json') for c in catalog]}),
          open(os.path.join(outB, 'data', 'versions.json'), 'w'), separators=(',', ':'))
for c in catalog:
    json.dump(encode(payloads[c['id']]), open(os.path.join(outB, 'data', c['id'] + '.json'), 'w'), separators=(',', ':'))

php = os.path.join(HERE, 'counter', 'visitor-counter.php')
if os.path.exists(php):
    for d in (outA, outB):
        shutil.copy(php, d)
        os.makedirs(os.path.join(d, 'counter-data'), exist_ok=True)
        open(os.path.join(d, 'counter-data', '.htaccess'), 'w').write('Require all denied\nDeny from all\n')

man = dict(product='Motor Smart GRID', builtAt=datetime.datetime.now().astimezone().isoformat(timespec='seconds'),
           opensFirstOnBuildDay=first['id'], versions=manifest_versions)
json.dump(man, open(os.path.join(KIT, 'manifest.json'), 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
for m in manifest_versions:
    print('%-11s %-62s rates %5d  %s' % (m['id'], m['label'], m['totalRates'], m['ratesByState']))
    print('            labels: %s' % m['ratesLabelled'])
