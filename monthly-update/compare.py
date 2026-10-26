"""Increased / Decreased labels: compare each revised rate with the rate it replaces.

A later version of the same month is compared with the version before it (the "Earlier"
version against the one that "Applies today"). The first version of a month is compared
with the workbook value a manual correction replaced.

How a rate is paired with its earlier rate (same state, segment and insurer, and then):
  - each condition of the rate (the parts joined by OR) is matched separately;
  - vehicle type keywords must agree (Ambulance, E-rickshaw, E-cart, Auto, Tractor,
    Long Term Package ...);
  - Private Car / Two-Wheeler: the same CC band (Upto 1000CC with Upto 1000CC ...), Electric only
    with Electric only, Except Electric with Except Electric;
  - two-wheelers: Bike with Bike, Scooter with Scooter, and the same make group
    (Honda / TVS / Suzuki, Bajaj, Hero / Yamaha, other makes, electric) - closest wins;
  - restricted-RTO rates ("Doable RTOs - ...", "Restricted RTOs", "TN/PY RTO's - ...")
    are only compared with restricted-RTO rates, the others with the others;
  - weight band (GVW), seats and vehicle age must overlap; the closest overlap wins
    (a "New" rate is compared with the earlier "New" rate, not with "Upto 10 Years").
The figure compared is the Package value, part by part (OD with OD, TP with TP; a flat
rate counts for both parts), or TP where Package is NA; if Package is unchanged, TP decides. Result per rate:
  up    - higher than the earlier rate(s)          -> "Increased" (green)
  down  - lower                                     -> "Decreased" (red)
  mixed - higher for one condition, lower for another -> both labels
  new   - no earlier rate to compare with           -> "New"
  same  - value unchanged (only wording changed)    -> no label
"""
import re

def num(v, sec=''):
    """Rate as {OD, TP} parts. '20.00(OD)+20.00(TP)' -> {OD:20, TP:20}; a flat '30.00' pays 30
    on both parts -> {OD:30, TP:30}; '1.00(TP)' -> {OD:0, TP:1}. SAOD rates have no TP part and
    SATP rates no OD part. 'NA' / None -> None."""
    if v in (None, '', 'NA'): return None
    s = str(v)
    parts = re.findall(r'(\d+(?:\.\d+)?)\s*\((OD|TP)\)', s)
    if parts:
        d = {'OD': 0.0, 'TP': 0.0}
        for n, k in parts: d[k] = float(n)
    else:
        m = re.search(r'\d+(?:\.\d+)?', s)
        if not m: return None
        d = {'OD': float(m.group()), 'TP': float(m.group())}
    if 'SAOD' in sec: d.pop('TP')
    if 'SATP' in sec: d.pop('OD')
    return d

def conds(rem):
    rem = rem or ''
    if rem.startswith('(') and rem.endswith(')') and ') OR (' in rem:
        return rem[1:-1].split(') OR (')
    return [rem]

def field(c, name):
    m = re.search(re.escape(name) + r':\s*(.*?)(?:\s\|\s|$)', c)
    return m.group(1) if m else ''

FAMILIES = [('AMB', r'AMBULANCE'), ('ERICK', r'E-?RICK|RICKSHAW'), ('ECART', r'E-?CART|E-?KART'),
            ('LT', r'LONG\s*TERM|\b[35]\s*\+\s*[35]\b'), ('TRACTOR', r'TRACTOR(?! ELEVATOR)'),
            ('AUTO', r'(?<!E-)\bAUTO\b|3W'), ('SCHOOL', r'SCHOOL'), ('STAFF', r'STAFF')]
def families(text):
    t = text.upper().replace('OTHER THAN AGRI TRACTOR', '')
    return {k for k, p in FAMILIES if re.search(p, t)}

MAKES = ['HONDA', 'TVS', 'SUZUKI', 'BAJAJ', 'HERO', 'YAMAHA', 'ROYAL ENFIELD', 'CHETAK', 'ATHER', 'VIDA', 'AMPERE', 'RIVER']
def makes(text):
    """two-wheeler make / fuel group named in a condition: {'HONDA','TVS','SUZUKI'}, {'OTHER'},
    {'EV','OTHER'} ... empty when no make is named"""
    t = text.upper().replace('YEMAHA', 'YAMAHA')
    out = set()
    if re.search(r'ELECTRIC|\bEV\b', t): out.add('EV')
    m = re.search(r'MAKE[^:]*:\s*([^;|]*)', t)
    seg = m.group(1) if m else t
    if re.search(r'OTHER\s+THAN|EXCEPT|OTHER\s+MAKES|\bOTHERS\b', seg):
        out.add('OTHER')
    else:
        out |= {k for k in MAKES if re.search(r'\b' + k + r'\b', seg)}
    return out

def vehicle(text):
    t = text.upper()
    return {k for k, p in (('BIKE', r'\bBIKE'), ('SCOOTER', r'SCOOTER')) if re.search(p, t)}

def cc_range(text):
    """engine CC band in the wording: 'Upto 1000CC' -> (0,1000), '1001 to 1200CC' -> (1001,1200),
    'Above 2001CC' -> (2002, inf), '151CC TO 350CC' -> (151,350); None when no CC is named"""
    t = text.upper()
    t = re.sub(r'(?:DECLIN\w*|EXCEPT|EXCLUD\w*|OTHER THAN)[^;|]*', ' ', t)   # "Declined: All TW above 350cc" is not the rate's band
    m = re.search(r'(\d+)\s*(?:CC)?\s*(?:TO|-)\s*(\d+)\s*CC', t)
    if m: return (int(m.group(1)), int(m.group(2)))
    m = re.search(r'(?:UP\s*TO|UPTO|BELOW|LESS THAN)\s*(\d+)\s*CC', t)
    if m: return (0, int(m.group(1)))
    m = re.search(r'(?:ABOVE|MORE THAN)\s*(\d+)\s*CC', t)
    if m: return (int(m.group(1)) + 1, 10**6)
    return None

def ev_kind(text):
    t = text.upper()
    if re.search(r'EXCEPT\s+(?:ALL\s+)?(?:ELECTRIC|EV)|EV\s+DECLIN', t): return 'no'
    if re.search(r'ELECTRIC\s+ONLY|EV\s+ONLY|ONLY\s+ELECTRIC', t): return 'only'
    return None

def restricted(c):
    t = (field(c, 'RTO') + ' ' + field(c, 'Remark')).upper()
    return bool(re.search(r'\bDOABLE\b|RESTRICTED|^\s*[A-Z/]{2,6}\s+RTO\W*S?\s*-', t))

def years(text):
    """vehicle age range in years from the Age / Remark wording; None = not stated"""
    t = text.upper()
    if re.search(r'ALL\s*AGE', t): return (0, 99)
    if re.search(r'2ND YEAR ONWARDS', t): return (1, 99)
    if not re.search(r'YEAR|YRS|\bNEW\b', t): return None
    new = bool(re.search(r'\bNEW\b', t)) and not re.search(r'OTHER THAN NEW|NON[\s-]*NEW', t)
    lo = 1 if re.search(r'OTHER THAN NEW', t) else 0
    m = re.search(r'(?:ABOVE|MORE THAN)\s*(\d+)\s*(?:YEARS?\s*)?(?:TO|-)\s*(\d+)', t)
    if m: return (int(m.group(1)) + 1, int(m.group(2)))
    m = re.search(r'(\d+)\s*(?:TO|-)\s*(\d+)\s*(?:YEARS?|YRS)', t)
    if m: return (min(int(m.group(1)), 0 if new else 99), int(m.group(2)))
    m = re.search(r'(?:ABOVE|MORE THAN|>)\s*(\d+)\s*(?:YEARS?|YRS)', t)
    if m: return (int(m.group(1)) + 1, 99)
    m = re.search(r'(?:UP\s*TO|UPTO|BELOW|LESS THAN)\s*(\d+)\s*(?:YEARS?|YRS)', t)
    if m: return (0 if new else lo, int(m.group(1)))
    if new: return (0, 0)
    return None

def gvw(seg):
    t = seg.upper().replace('UP TO', 'UPTO')
    ns = [int(n) for n in re.findall(r'\d{3,6}', t)]
    if not ns: return None
    if 'ABOVE' in t: return (ns[0] + 1, 10**6)
    if 'UPTO' in t and len(ns) == 1: return (0, ns[0])
    if len(ns) >= 2: return (min(ns[:2]), max(ns[:2]))
    return None

def seats(text):
    t = text.upper()
    m = re.search(r'(\d+)\s*\+\s*1', t)
    if m and 'SEAT' not in t: return (1, int(m.group(1)) + 1)
    m = re.search(r'(\d+)\s*(?:TO|-)\s*(\d+)\s*SEAT', t)
    if m: return (int(m.group(1)), int(m.group(2)))
    m = re.search(r'(?:ABOVE|MORE THAN)\s*(\d+)\s*SEAT', t)
    if m: return (int(m.group(1)) + 1, 999)
    m = re.search(r'(?:UPTO|UP TO)\s*(\d+)\s*SEAT', t)
    if m: return (1, int(m.group(1)))
    return None

def overlap(a, b):
    """1.0 for identical ranges, 0 for none, in between for partial; 1 when either is unknown"""
    if a is None or b is None: return 1.0
    lo, hi = max(a[0], b[0]), min(a[1], b[1])
    if lo > hi: return 0.0
    inter = hi - lo + 1; union = max(a[1], b[1]) - min(a[0], b[0]) + 1
    return inter / union

def profile(rec, c):
    text = rec['segment'] + ' | ' + c
    return dict(cc=cc_range(rec['segment'] + ' ' + field(c, 'Remark')) if rec['single'] else None,
                ev=ev_kind(field(c, 'Remark')) if rec['single'] else None,
                veh=vehicle(rec['segment']) if rec['single'] else set(),
                mk=makes(field(c, 'Remark')) if rec['single'] else set(),
                fam=families(rec['segment'] + ' ' + field(c, 'Remark') + ' ' + field(c, 'Age (Com/TP)')),
                rto=restricted(c), age=years(field(c, 'Age (Com/TP)') + ' ' + field(c, 'Remark')),
                w=gvw(rec['segment']) if not rec['single'] else None, seats=seats(text))

def score(a, b):
    if a['rto'] != b['rto']: return 0.0
    if a['fam'] or b['fam']:
        if not (a['fam'] & b['fam']): return 0.0
        if ('LT' in a['fam']) != ('LT' in b['fam']): return 0.0
    if a['veh'] and b['veh'] and not (a['veh'] & b['veh']): return 0.0          # Bike vs Scooter
    if a['ev'] and b['ev'] and a['ev'] != b['ev']: return 0.0                    # Electric only vs Except Electric
    mk = 1.0
    if a['mk'] and b['mk']:                                                      # same make group, closest wins
        inter = a['mk'] & b['mk']
        if not inter: return 0.0
        mk = len(inter) / len(a['mk'] | b['mk'])
    return mk * overlap(a['w'], b['w']) * overlap(a['seats'], b['seats']) * overlap(a['age'], b['age']) * overlap(a['cc'], b['cc'])

def direction(cur, olds):
    """Compare OD with OD and TP with TP: all parts higher or equal (one higher) -> up,
    all lower or equal (one lower) -> down, some higher and some lower -> mixed."""
    olds = [o for o in olds if o is not None]
    if cur is None or not olds: return None
    up = dn = False
    for o in olds:
        for k in set(cur) & set(o):
            if cur[k] > o[k] + 1e-9: up = True
            elif cur[k] < o[k] - 1e-9: dn = True
    return 'mixed' if up and dn else ('up' if up else ('down' if dn else 'same'))

def combine(ds):
    ds = [d for d in ds if d]
    if not ds: return 'new'
    up = any(d in ('up', 'mixed') for d in ds); dn = any(d in ('down', 'mixed') for d in ds)
    if up and dn: return 'mixed'
    if up: return 'up'
    if dn: return 'down'
    return 'same' if any(d == 'same' for d in ds) else 'new'

def part_deltas(col, cur, olds):
    """(column, part, change) for every part that moved, against each earlier rate"""
    out = []
    for o in olds:
        if o is None: continue
        for k in sorted(set(cur) & set(o)):
            d = round(cur[k] - o[k], 2)
            if abs(d) > 1e-9: out.append((col, k, d))
    return out

def fmt_delta(ds, up, sec=''):
    """'+3.00' (same change on OD and TP, or a single part), '+5.00(OD) +10.00(TP)',
    'TP +5.00' (TP column), '+3.00 to +5.00' when the earlier rates differ."""
    ds = [x for x in ds if (x[2] > 0) == up]
    if not ds: return ''
    sign = lambda v: ('+' if v > 0 else '\u2212') + '%.2f' % abs(v)
    def rng(vals):
        lo, hi = min(vals), max(vals)
        a, b = (lo, hi) if up else (hi, lo)
        return sign(a) if abs(lo - hi) < 1e-9 else sign(a) + ' to ' + sign(b)
    out = []
    for col in ('package', 'tp'):
        g = {}
        for c_, k, v in ds:
            if c_ == col: g.setdefault(k, []).append(v)
        if not g: continue
        if col == 'tp':
            out.append('TP ' + rng([v for vs in g.values() for v in vs])); continue
        if set(g) == {'OD', 'TP'} and sorted(g['OD']) == sorted(g['TP']):
            out.append(rng(g['OD']))
        elif len(g) == 1:
            k = next(iter(g))
            one_part = 'SAOD' in sec or 'SATP' in sec      # these sections have only one part
            out.append(rng(g[k]) + ('' if one_part else '(%s)' % k))
        else:
            out.append(' '.join(rng(g[k]) + '(%s)' % k for k in ('OD', 'TP') if k in g))
    return ' \u00B7 '.join(out)

def set_deltas(r, D):
    up, dn = fmt_delta(D, True, r['sec']), fmt_delta(D, False, r['sec'])
    if up and r['chg'] in ('up', 'mixed'): r['dup'] = up
    if dn and r['chg'] in ('down', 'mixed'): r['ddn'] = dn

def fmt_was(vals):
    vals = list(dict.fromkeys(v for v in vals if v not in (None, 'NA')))
    return ' or '.join(vals)

def compare_with_previous(cur_recs, prev_recs):
    """Label every flagged rate (r['rev']) of cur_recs against prev_recs (the version before)."""
    idx = {}
    for p in prev_recs:
        for c in conds(p['remarks']):
            idx.setdefault((p['state'], p['sec'], p['company']), []).append((p, profile(p, c)))
    for r in cur_recs:
        if not r.get('rev'): continue
        cands_all = idx.get((r['state'], r['sec'], r['company']), [])
        ds, was, D = [], [], []
        for c in conds(r['remarks']):
            me = profile(r, c)
            scored = [(score(me, pf), p) for p, pf in cands_all]
            res, w = None, None
            for col in (('package',) if r['single'] else ('package', 'tp')):
                cur = num(r[col], r['sec'])
                pool = [(sc, p) for sc, p in scored if sc > 0 and num(p[col], p['sec']) is not None]
                if cur is None or not pool: continue
                best = max(sc for sc, _ in pool)
                olds = [p for sc, p in pool if sc >= best - 1e-9]
                d = direction(cur, [num(p[col], p['sec']) for p in olds])
                if res is None or res == 'same':          # Package decides; TP only when Package is unchanged / NA
                    res = d
                    if d not in (None, 'same'): D += part_deltas(col, cur, [num(p[col], p['sec']) for p in olds])
                    w = ('' if r['single'] else ('Package ' if col == 'package' else 'TP ')) + fmt_was(p[col] for p in olds)
                if res != 'same': break
            if w and res in ('up', 'down', 'mixed'): was.append(w)
            ds.append(res)
        r['chg'] = combine(ds)
        if r['chg'] in ('up', 'down', 'mixed'):
            r['was'] = '; '.join(dict.fromkeys(w for w in was if w.strip())); set_deltas(r, D)

def compare_with_corrections(cur_recs):
    """First version of a month: a corrected rate against the workbook value it replaced."""
    for r in cur_recs:
        prevs = r.pop('_prevs', None)
        if not r.get('rev'): continue
        if not prevs:
            r['chg'] = 'new'; continue
        ds, was, D = [], [], []
        for pk, tp in prevs:
            cur, old = num(r['package'], r['sec']), num(pk, r['sec'])
            d = direction(cur, [old])
            if d not in (None, 'same'): D += part_deltas('package', cur, [old])
            if d in (None, 'same') and not r['single']:
                cur, old = num(r['tp'], r['sec']), num(tp, r['sec'])
                d2 = direction(cur, [old])
                if d2 not in (None, 'same'): D += part_deltas('tp', cur, [old])
                d = d2 if d2 else d
            ds.append(d)
            was.append(pk if r['single'] else '%s / %s' % (pk or 'NA', tp or 'NA'))
        r['chg'] = combine(ds)
        if r['chg'] in ('up', 'down', 'mixed'):
            r['was'] = ' or '.join(dict.fromkeys(was)); set_deltas(r, D)
