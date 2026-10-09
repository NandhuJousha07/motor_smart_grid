"""Build Motor Smart GRID data JSON from an insurer PAYOUT Grid workbook.

usage: python3 build.py <payout.xlsx> <out.json> [period_display] [published_month] [version]
"""
import sys, re, json, collections
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from parse import parse

STATES = [("TN", "Tamil Nadu"), ("KL", "Kerala"), ("KA", "Karnataka"),
          ("AP-TS", "Andhra Pradesh & Telangana"), ("MH", "Maharashtra")]
ORDER = [
 ("LCV Upto 2000", "LCV (Upto 2000)"), ("LCV 2001 to 3500", "LCV – 2001 to 3500"),
 ("LCV 3501 to 7500", "LCV – 3501 to 7500"), ("MCV 7501 to 12000", "MCV – 7501 to 12000"),
 ("MCV 12001 to 20000", "MCV – 12001 to 20000"), ("HCV 20000 to 40000", "HCV – 20000 to 40000"),
 ("HCV Above 40000", "HCV – Above 40000"), ("HCV Flat Bed", "HCV - Flat Bed"),
 ("LCV Auto GCV & E-Kart", "LCV - Auto GCV & E-Kart"),
 ("Misc-D Agricultural Tractor", "Misc-D – Agricultural Tractor"),
 ("Misc-D Other than Agricultural Tractor", "Misc-D - Other than Agricultural Tractor"),
 ("PCV Auto", "PCV – Auto"), ("PCV Taxi (Upto 6-Seater)", "PCV – Taxi (Upto 6-Seater)"),
 ("PCV Taxi & Stage Bus (More than 6-seats)", "PCV – Taxi & Stage Bus (More than 6-seats)"),
 ("PCV School Bus", "PCV - School Bus"), ("PCV Staff Bus", "PCV - Staff Bus"),
 ("Private Car - Bundle", "Private Car - Bundle"), ("Private Car - Package", "Private Car – Package"),
 ("Private Car - SAOD", "Private Car – SAOD"), ("Private Car - SATP", "Private Car – SATP"),
 ("Two-Wheeler - Bundle", "Two-Wheeler – Bundle"), ("Two-Wheeler - Package", "Two-Wheeler – Package"),
 ("Two-Wheeler - SAOD", "Two-Wheeler – SAOD"), ("Two-Wheeler - SATP", "Two-Wheeler – SATP"),
]
TITLE = dict(ORDER)
SINGLE = {k for k, _ in ORDER if k.startswith(("Private Car", "Two-Wheeler"))}

CANON = {
 'TATA': 'TATA AIG', 'TATA AIG': 'TATA AIG', 'CHOLA': 'Chola MS', 'CHOLA MS': 'Chola MS',
 'SHRIRAM': 'Shriram', 'SHRIRAM-AP': 'Shriram', 'SHRIRAM-TS': 'Shriram', 'DIGIT': 'Go Digit',
 'GO DIGIT': 'Go Digit', 'MAGMA': 'Magma', 'ORIENTAL': 'Oriental', 'NATIONAL': 'National',
 'UNITED INDIA': 'United India', 'NEW INDIA': 'New India', 'KOTAK': 'Kotak', 'RAHEJA': 'Raheja',
 'RELIANCE': 'Reliance', 'LIBERTY': 'Liberty', 'BAJAJ': 'Bajaj', 'ZUNO': 'Zuno',
 'UNIVERSAL SOMPO': 'Universal Sompo', 'UNIVERSAL SOMBO': 'Universal Sompo', 'RSA': 'Royal Sundaram',
 'ROYAL SUNDARAM': 'Royal Sundaram', 'KSHEMA': 'Kshema', 'ICICI': 'ICICI', 'SBI': 'SBI',
 'HDFC ERGO': 'HDFC ERGO', 'HDFC': 'HDFC ERGO', 'IFFCO': 'IFFCO', 'FG': 'FG',
 'FUTURE GENERALI': 'Future Generali',
}
def canon(c):
    return CANON.get(re.sub(r'\s+', ' ', c).strip().upper(), c.strip())

# ---------- text clean-up ----------
def clean(s):
    s = re.sub(r'\s+', ' ', s or '').strip()
    s = re.sub(r"RTO['’`]s\b", 'RTOs', s, flags=re.I)
    s = re.sub(r'\bupto\b', 'Upto', s, flags=re.I)
    s = re.sub(r'\s+,', ',', s)
    s = re.sub(r',(?=[^\s\d])', ', ', s)
    s = re.sub(r'(?<=[A-Za-z]),(?=\d)', ', ', s)          # TN01,TN02 -> TN01, TN02
    s = re.sub(r'(?<=\d),(?=[A-Z]{2}\d)', ', ', s)
    s = re.sub(r'(?<=\d),(?=[A-Z]{2}-?\d)', ', ', s)
    return s.strip(' ,')

def fmt_disc(v):
    if isinstance(v, (int, float)) and not isinstance(v, bool) and 0 < v <= 1:
        return 'Upto %s%%' % ('%g' % round(v * 100, 2))
    return clean(str(v)) if v not in (None, '') else ''

AGE_JUNK = re.compile(r'\b(KW|CPA|TPPD)\b', re.I)

def bundle(r):
    age = clean(r['age']); remark = clean(r['remark']); disc = fmt_disc(r['disc_raw'])
    if age and AGE_JUNK.search(age) and not re.search(r'year|new|old|renew|roll', age, re.I):
        remark = (remark + ', ' + age) if remark else age; age = ''
    p = []
    if age: p.append('Age (Com/TP): ' + age)
    if disc: p.append('Discount: ' + disc)
    if remark: p.append('Remark: ' + remark)
    rto = clean(r['rto'])
    if rto: p.append('RTO: ' + rto)
    return ' | '.join(p)

# ---------- insurer-specific remark wording ----------
HAZARDOUS_LIST = ('Chemical Category, Gas Category, Hydrogen Category, ITB (Integrated Tug Barges) Category, '
                  'LNG Carrier Category, Oil Category, Petrol / Diesel Category, Slurry Category, '
                  'Wine/Alcohal Category, LPG/CNG Carrier Category, Flammable liquids Category')
HAZARDOUS_TEXT = 'Doable Hazardous category - ' + HAZARDOUS_LIST

def shriram_remark(text):
    """User rule (06 Oct 2026): ONLY where the full text
    'Hazardous category - Chemical Category, ..., Flammable liquids Category' is found,
    replace it (together with any 'Except/Expect New Mahindra and/-' in front of it) with
    'Declined New Mahindra. Doable Hazardous category - <list>'. Everything else is left
    exactly as in the source sheet."""
    if not text: return text
    t = re.sub(r'\s+', ' ', text).strip()
    list_re = r'\s*,\s*'.join(re.escape(x.strip()) for x in HAZARDOUS_LIST.split(','))
    pat = re.compile(r'(?:\bEx\w*\s+New\s+Mahindra\s*(?:and|-|&)\s*)?Hazardous category\s*-\s*'
                     + list_re, re.I)
    if not pat.search(t): return text
    return pat.sub(lambda m: 'Declined New Mahindra. ' + HAZARDOUS_TEXT, t)

REMARK_RULES = {'Shriram': shriram_remark}

# ---------- values ----------
def fmt_val(v):
    if v is None: return None
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        return '%.2f' % v
    s = re.sub(r'\s+', ' ', str(v)).strip()
    if s in ('', '-', '--', 'NA', 'N/A', 'na', 'Nil', 'NIL', '0%'):
        return None if s != '0%' else '0.00'
    s = re.sub(r'\s*\(\s*', '(', s); s = re.sub(r'\s*\)', ')', s)
    s = re.sub(r'\s*\+\s*', '+', s)
    def num(m):
        return '%.2f' % float(m.group(0))
    s2 = re.sub(r'\d+(?:\.\d+)?', num, s)
    # strip trailing % if any
    s2 = s2.replace('%', '')
    if not re.search(r'\d', s2): return None
    return s2

def keyval(s):
    if not s: return None
    m = re.match(r'\s*(-?\d+(?:\.\d+)?)', s)
    return float(m.group(1)) if m else None

# ---------- classification ----------
GVW = [("LCV Upto 2000", 0, 2000), ("LCV 2001 to 3500", 2001, 3500), ("LCV 3501 to 7500", 3501, 7500),
       ("MCV 7501 to 12000", 7501, 12000), ("MCV 12001 to 20000", 12001, 20000),
       ("HCV 20000 to 40000", 20001, 40000), ("HCV Above 40000", 40001, 10**9)]

def gvw_range(cat):
    c = cat.upper().replace('UP TO', 'UPTO')
    c = re.sub(r'\(WITHOUT CPA LESS 1 ?%\)', '', c)
    nums = [int(n) for n in re.findall(r'\d+', c) if int(n) >= 100 or (int(n) == 0 and re.search(r'\b0\s*(TO|-)', c))]
    if not nums: return None
    if '& ABOVE' in c or 'AND ABOVE' in c:
        return (min(nums), 10**9)
    if len(nums) >= 2:
        lo, hi = nums[0], nums[1]
        if lo > hi: lo, hi = hi, lo
        return (lo, hi)
    n = nums[0]
    if 'ABOVE' in c:
        return (n + 1 if n % 10 == 0 else n, 10**9)
    if 'UPTO' in c or 'BELOW' in c or 'LESS' in c:
        return (0, n)
    return None

def classify_cv(prod, cat):
    P = prod.upper(); C = cat.upper()
    if 'MOTOR TRADE' in P or 'MOTOR TRADE' in C: return []
    if 'FOR ALL OTHER CV' in C: return ["Misc-D Other than Agricultural Tractor"]
    misd = P.replace(' ', '') in ('MISD', 'MISC-D', 'MISCD', 'MIS-D') or any(
        k in C for k in ('HARVEST', 'EXCAVAT', 'EXAVAT', 'CRANE', 'BACKHOE', 'MISD', 'MISC-D', 'AMBULANCE'))
    if 'TRACTOR' in C and 'OTHER THAN' not in C and 'OTHERS' not in C:
        return ["Misc-D Agricultural Tractor"]
    if misd and not ('E-RICK' in C and P == 'CV'):
        return ["Misc-D Other than Agricultural Tractor"]
    out = []
    erick = 'E-RICK' in C or 'RICKSHAW' in C or 'RIKSHAW' in C
    ecart = 'E-CART' in C or 'E-KART' in C or 'ECART' in C
    if 'EXCEPT E-CART' in C: ecart = False
    if P.startswith('PCCV') or (P in ('GCCV/PCCV', 'PCCV/GCCV', 'CV') and erick):
        if erick or 'AUTO' in C or '3W' in C:
            out.append("PCV Auto")
        if 'SCHOOL' in C: out.append("PCV School Bus")
        if 'STAFF' in C: out.append("PCV Staff Bus")
        if 'TAXI' in C or 'BUS' in C and not ('SCHOOL' in C or 'STAFF' in C):
            up6 = bool(re.search(r'6\s*\+\s*1|4\s*\+\s*1|UPTO 6\b(?! TO)|BELOW 6|LESS THAN 6|UPTO 7\b|\(2 TO 6', C))
            more = bool(re.search(r'7\s*(TO|-|\+)|8 TO|11 TO|21|30|31|36|ABOVE|6\s*-\s*1\d|6 TO 17|6-10|BUS', C))
            if 'TAXI' in C and not up6 and not more: up6 = more = True   # un-banded taxi rate -> both taxi sections
            if up6: out.append("PCV Taxi (Upto 6-Seater)")
            if more: out.append("PCV Taxi & Stage Bus (More than 6-seats)")
        if ecart: out.append("LCV Auto GCV & E-Kart")
        return out
    # goods
    if 'FLAT BED' in C: return ["HCV Flat Bed"]
    if ecart or erick or (re.search(r'\b3W\b|AUTO', C) and not re.search(r'EXCLUDING (GCV )?3W', C)):
        out.append("LCV Auto GCV & E-Kart")
        if erick and P in ('GCCV/PCCV', 'PCCV/GCCV', 'CV'): out.append("PCV Auto")
    rg = gvw_range(C)
    if rg:
        lo, hi = rg
        out += [k for k, a, b in GVW if lo <= b and hi >= a]
    return list(dict.fromkeys(out))

def classify_single(block, cat, has_pkg, has_tp):
    C = cat.upper().replace('PACAKGE', 'PACKAGE').replace('SCCOTER', 'SCOOTER')
    pre = "Private Car - " if block == 'PC' else "Two-Wheeler - "
    out = []
    if re.search(r'BUNDLE|1\s*\+\s*[35]\b', C) or re.search(r'-NEW\(1\+5', C):
        out.append('Bundle')
    if re.search(r'PACKAGE|1\s*\+\s*1\b', C) and 'Bundle' not in out:
        out.append('Package')
    elif 'PACKAGE' in C and re.search(r'PACKAGE\s*&|,\s*PACKAGE|&\s*PACKAGE', C):
        out.append('Package')
    if re.search(r'SAOD|\bOD\b', C): out.append('SAOD')
    if re.search(r'SATP|\bTP\b', C) and not re.search(r'PACKAGE/TP', C): out.append('SATP')
    if not out:
        if has_pkg: out.append('Package')
        elif has_tp: out.append('SATP')
    return [pre + o for o in dict.fromkeys(out)]

def seg_text(cat):
    return clean(cat)

def apply_corrections(rows, corrections):
    """Manual corrections agreed with the business, applied on top of the source sheet.
    Each entry: {"sheet", "row", "expect": {...current values...}, "set": {...new values...},
    "note"}. The row must still hold the expected values, or the build stops, so a
    correction never lands on the wrong row when the sheet changes."""
    applied = []
    for c in corrections or []:
        hit = [r for r in rows if r['sheet'] == c['sheet'] and r['row'] == c['row']]
        if not hit:
            raise SystemExit('Correction not applied - %s row %s not found (%s)' % (c['sheet'], c['row'], c.get('note', '')))
        r = hit[0]
        for k, v in c.get('expect', {}).items():
            cur = r.get(k)
            if str(cur).strip().upper() != str(v).strip().upper():
                raise SystemExit('Correction not applied - %s row %s: %s is %r, expected %r (%s)'
                                 % (c['sheet'], c['row'], k, cur, v, c.get('note', '')))
        for k, v in c['set'].items():
            r[k] = v
            if k == 'disc': r['disc_raw'] = v
        applied.append(c)
    return applied

def build(path, corrections=None):
    rows = parse(path)
    apply_corrections(rows, corrections)
    recs = []
    for i, r in enumerate(rows):
        if not r['company'] or not r['cat']: continue
        co = canon(r['company'])
        pkg = fmt_val(r['pkg']); tp = fmt_val(r['tp'])
        if pkg is None and tp is None: continue
        if co in REMARK_RULES: r = dict(r, remark=REMARK_RULES[co](r['remark']))
        b = bundle(r)
        block = r['block'] or 'CV'
        if block in ('PC', 'TW'):
            secs = classify_single(block, r['cat'], pkg is not None, tp is not None)
            seg = seg_text(r['cat'])
            satp = [s for s in secs if s.endswith('SATP')]
            for s in secs:
                if s.endswith('SATP'): continue
                if pkg is None: continue
                recs.append(dict(state=r['state'], sec=s, company=co, segment=seg,
                                 package=pkg, tp=None, b=b, src=i, single=True, offer=r.get('offer')))
            sv = tp if tp is not None else (pkg if satp else None)
            if sv is not None:
                s = ("Private Car - SATP" if block == 'PC' else "Two-Wheeler - SATP")
                sseg = seg if re.search(r'SATP|\bTP\b', seg, re.I) else 'SATP \u2013 ' + seg
                recs.append(dict(state=r['state'], sec=s, company=co, segment=sseg,
                                 package=sv, tp=None, b=b, src=i, single=True, offer=r.get('offer')))
        else:
            C = r['cat'].upper()
            secs = classify_cv(r['product'], r['cat'])
            for s in secs:
                seg = seg_text(r['cat'])
                if r['product'].upper() == 'CV' and ('E-RICK' in C and 'E-CART' in C):
                    seg = 'E-Rickshaw' if s == 'PCV Auto' else 'E-Cart'
                recs.append(dict(state=r['state'], sec=s, company=co, segment=seg,
                                 package=pkg, tp=tp, b=b, src=i, single=False, offer=r.get('offer')))
    # merge identical offers
    groups = collections.OrderedDict()
    for x in recs:
        # a promotional offer (manual correction) keeps its rate as a separate entry
        k = (x['state'], x['sec'], x['company'], x['segment'], x['package'], x['tp'],
             json.dumps(x.get('offer'), sort_keys=True, ensure_ascii=False))
        g = groups.setdefault(k, dict(x, bs=[]))
        if x['b'] not in g['bs']: g['bs'].append(x['b'])
    out = []
    for g in groups.values():
        bs = [b for b in g['bs']]
        if len(bs) == 1: rem = bs[0]
        else: rem = ' OR '.join('(' + b + ')' if b else '(-)' for b in bs)
        out.append(dict(state=g['state'], sec=g['sec'], title=TITLE[g['sec']], company=g['company'],
                        segment=g['segment'], package=g['package'] if g['package'] is not None else ('NA' if not g['single'] else None),
                        tp=(g['tp'] if g['tp'] is not None else 'NA') if not g['single'] else None,
                        remarks=rem, single=g['single'], offer=g.get('offer'), _src=g['src']))
    # rank
    by = collections.defaultdict(list)
    for x in out: by[(x['state'], x['sec'])].append(x)
    final = []
    so = {k: i for i, (k, _) in enumerate(STATES)}; oo = {k: i for i, (k, _) in enumerate(ORDER)}
    for k in sorted(by, key=lambda k: (so[k[0]], oo[k[1]])):
        v = by[k]
        def kv(x):
            p = keyval(x['package']); t = keyval(x['tp'])
            return p if p is not None else (t if t is not None else -1)
        v.sort(key=lambda x: (-kv(x), x['_src']))
        for n, x in enumerate(v):
            x['rank'] = n; del x['_src']
            rec = dict(state=x['state'], sec=x['sec'], title=x['title'], company=x['company'],
                       segment=x['segment'], package=x['package'], tp=x['tp'], remarks=x['remarks'],
                       rank=n, single=x['single'])
            if x.get('offer'): rec['offer'] = x['offer']
            final.append(rec)
    present = sorted({x['state'] for x in final}, key=lambda s: so[s])
    return dict(states=[dict(code=c, name=n) for c, n in STATES if c in present],
                order=[dict(key=k, title=t) for k, t in ORDER], records=final)

if __name__ == '__main__':
    d = build(sys.argv[1])
    a = sys.argv[3:]
    if len(a) > 0: d['periodDisplay'] = a[0]
    if len(a) > 1: d['publishedMonth'] = a[1]
    if len(a) > 2: d['version'] = a[2]
    d['revisionNote'] = ''
    json.dump(d, open(sys.argv[2], 'w'), ensure_ascii=False)
    print(len(d['records']), collections.Counter(r['state'] for r in d['records']))
