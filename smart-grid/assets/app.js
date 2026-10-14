/* ===== Motor Smart GRID – data protection =====================================
   Deterrents only: blocks right-click, inspect / view-source / save / print
   shortcuts, copying and text selection, and hides the GRID while developer
   tools are open. The rate data is shipped encoded, not as readable JSON.
   A browser must receive data to show it, so this stops casual copying, not a
   determined expert — keep the page behind the portal login for real control. */
var __GRID_KEY = 'MSG-Oct26-prot';
function __gridDecode(src){
  var obj = (typeof src === 'string') ? JSON.parse(src) : src;
  if (!obj || typeof obj.enc !== 'string') return obj;
  var bin = atob(obj.enc), n = bin.length, bytes = new Uint8Array(n), k = __GRID_KEY, kl = k.length;
  for (var i = 0; i < n; i++) bytes[i] = bin.charCodeAt(i) ^ k.charCodeAt(i % kl) ^ ((i * 31) & 255);
  return JSON.parse(new TextDecoder('utf-8').decode(bytes));
}
(function(){
  function isEditable(t){
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  }
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  document.addEventListener('dragstart', function(e){ e.preventDefault(); });
  document.addEventListener('selectstart', function(e){ if (!isEditable(e.target)) e.preventDefault(); });
  ['copy', 'cut'].forEach(function(ev){
    document.addEventListener(ev, function(e){ if (!isEditable(e.target)) e.preventDefault(); });
  });
  document.addEventListener('keydown', function(e){
    var k = (e.key || '').toLowerCase(), ctrl = e.ctrlKey || e.metaKey;
    var block =
      k === 'f12' ||
      (ctrl && e.shiftKey && (k === 'i' || k === 'j' || k === 'c' || k === 'k')) ||  // DevTools / console / inspector
      (e.metaKey && e.altKey && (k === 'i' || k === 'j' || k === 'c' || k === 'u')) || // Mac DevTools / source
      (ctrl && (k === 'u' || k === 's' || k === 'p'));                                // view-source, save, print
    if (!block && ctrl && (k === 'a' || k === 'c' || k === 'x') && !isEditable(e.target)) block = true; // select-all / copy outside search boxes
    if (block){ e.preventDefault(); e.stopPropagation(); return false; }
  }, true);

  // Hide the GRID while developer tools are open. The `debugger` statement only
  // pauses when DevTools is open, so a long pause means DevTools is open.
  var shield = null;
  function setShield(on){
    if (!shield){
      shield = document.createElement('div');
      shield.className = 'protect-shield';
      shield.setAttribute('role', 'alert');
      shield.innerHTML = '<div><h2>Protected content</h2><p>Close developer tools to view the Motor Smart GRID.</p></div>';
      (document.body || document.documentElement).appendChild(shield);
    }
    shield.classList.toggle('on', on);
    var r = document.getElementById('results'); if (r) r.style.visibility = on ? 'hidden' : '';
  }
  function probe(){
    var t = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    setShield(performance.now() - t > 120);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setInterval(probe, 1500); });
  else setInterval(probe, 1500);
})();
/* ===== Motor Smart GRID – visitor counter =====================================
   Shows "Today's visitors: N · Total visitors: N" in the footer.
   A visit = one browser (or one signed-in person) on one day, India time: opening
   the GRID again the same day doesn't add, coming back the next day does.
   Nothing about a visitor is recorded beyond that.
   - Your own website: <meta name="grid-visitor-counter" content="visitor-counter.php">
   - claude.ai: each signed-in visitor keeps one record in this page's database
     (last visit date + number of visit days). Totals are summed from those records. */
(function(){
  var box = document.getElementById('visitor-count');
  var numT = document.getElementById('visitor-count-n');
  var numD = document.getElementById('visitor-today-n');
  function fmt(n){ return Number(n).toLocaleString('en-IN'); }
  function show(total, today, plus){
    if (!box || !numT || typeof total !== 'number' || !isFinite(total) || total < 1) return false;
    numT.textContent = fmt(total) + (plus ? '+' : '');
    if (numD) numD.textContent = fmt(Math.max(0, Number(today) || 0)) + (plus ? '+' : '');
    box.hidden = false;
    return true;
  }
  function istDay(){ return new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10); }
  function claudeCount(){
  if (!window.claude || typeof window.claude.use !== 'function') return;
  Promise.all([window.claude.use('db'), window.claude.use('user')]).then(function(r){
    var db = r[0], user = r[1];
    if (!db) return;
    var today = istDay();
    var countAll = function(){
      return db.collection('counter').limit(1000).get()
        .then(function(snap){
          var total = 0, todayN = 0;
          (snap.docs || []).forEach(function(d){
            var v = d.data() || {};
            var n = Number(v.days); total += (isFinite(n) && n > 0) ? n : 1;   // older records = 1 visit
            if (v.last === today) todayN++;
          });
          show(total, todayN, snap.size >= 1000);
        })
        .catch(function(){});
    };
    (user ? user.id() : Promise.resolve(null)).then(function(uid){
      if (!uid) return countAll();
      var ref = db.doc('counter/' + uid);
      return ref.get().then(function(s){
        var v = s.exists ? (s.data() || {}) : null;
        if (v && v.last === today) return null;                       // already counted today
        var days = v ? ((Number(v.days) > 0 ? Number(v.days) : 1) + 1) : 1;
        return ref.set({ first: (v && v.first) || Date.now(), last: today, days: days }).catch(function(){});
      }).catch(function(){}).then(countAll);
    });
  }).catch(function(){});
  }
  var meta = document.querySelector('meta[name="grid-visitor-counter"]');
  var url = meta && meta.content ? meta.content.trim() : '';
  if (!url || location.protocol === 'file:'){ claudeCount(); return; }
  // Problems are reported in the browser console (F12 is blocked on the page: use the browser menu),
  // so the deployment team can see why the line is hidden.
  function warn(m){ try { console.warn('[Smart GRID] Visitor counter: ' + m + ' Check ' + url + '?check=1 and DEPLOYMENT_GUIDE.md section 9.'); } catch(e){} }
  fetch(url, { method: 'POST', credentials: 'same-origin', cache: 'no-store' })
    .then(function(r){
      if (!r.ok){ warn(url + ' answered HTTP ' + r.status + ' (404: file not uploaded next to the page; 405 or 501: PHP not running for it; 500: counter-data/ not writable).'); return null; }
      return r.text().then(function(t){
        try { return JSON.parse(t); }
        catch(e){ warn(url + ' did not return JSON: PHP is not running for this file (the server sent it as text).'); return null; }
      });
    })
    .then(function(d){ if (!(d && show(Number(d.visitors), Number(d.today)))) claudeCount(); })
    .catch(function(){ warn(url + ' could not be reached.'); claudeCount(); });
})();
function startGrid(DATA){
  // ---- GRID versions, month-wise. DATA = {versions:[{id,name,label,month,version,start,end,period,note,data|file}]}
  // A version carries its rates inline (data) or as a separate file (file), loaded when it is opened.
  var VERS = (DATA && DATA.versions) ? DATA.versions
    : [{ id:'grid', name:'', label:'', month:DATA.publishedMonth || '', version:DATA.version || '', start:'', end:'',
         period:DATA.periodDisplay || '', note:DATA.revisionNote || '', data:DATA }];
  function istToday(){ return new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10); }
  function versionState(v){
    var t = istToday();
    if (!v.start) return 'current';
    return t < v.start ? 'upcoming' : (t > v.end ? 'earlier' : 'current');
  }
  function loadVersion(v){
    if (v.data) return Promise.resolve(v.data);
    if (!v._p){
      v._p = fetch(v.file, { cache:'no-cache' })
        .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function(d){ v.data = __gridDecode(d); return v.data; }, function(e){ v._p = null; throw e; });
    }
    return v._p;
  }
  function loadError(err){
    var box = document.getElementById('results');
    if (box) box.innerHTML = '<div class="empty"><h3>GRID data could not be loaded</h3><p>' +
      String((err && err.message) || err).replace(/[<>&]/g, '') + ' — please refresh, or contact the MIS team.</p></div>';
  }
  var firstV = VERS.filter(function(v){ return versionState(v) === 'current'; }).pop()
    || VERS.filter(function(v){ return versionState(v) === 'earlier'; }).pop() || VERS[0];
  loadVersion(firstV).then(function(d){ initGrid(firstV, d); }).catch(loadError);

  function initGrid(openV, VD){
  var openVersion = openV;
  var records = VD.records;

  // ---- Vehicle age selector: New | Both | Rollover / Renewal ----
  // Each condition of a rate is read for vehicle age: the Age column first, otherwise the
  // Discount and Remark text ("New Vehicle", "Renewal & Rollover", "Above 6 Years", "With NCB"...).
  // 'new', 'old' (rollover / renewal) or 'both'. A condition that says nothing about age
  // applies to all ages: it is labelled "Age (Com/TP): All ages" and shown in every position.
  // Choosing New or Rollover / Renewal hides only the other kind; ranks (top 3, BEST) are
  // recounted over what remains.
  // OFF for now (13 Oct 2026): the age wording in the GRID data still needs checking.
  // Set to true to show the New | Both | Rollover / Renewal selector and the "All ages" labels.
  var AGE_FILTER_ON = false;
  var showNew = true, showOld = true;
  // Vehicle-age reading for one rate condition ("Age (Com/TP): … | Discount: … | Remark: … | RTO: …").
  // Returns { kind: 'new' | 'old' | 'both', stated: true when the text says something about age }.
  // Order: the Age column first; if it holds no age wording, the Discount and Remark text.
  function ageInfo(cond){
    cond = cond || '';
    function field(name){ var m = new RegExp(name + ':\\s*(.*?)(?:\\s\\|\\s|$)').exec(cond); return m ? m[1] : ''; }
    var AGE_WORD = /\bnew\b|roll\s*over|renewal|\bold\b|year|yrs|\bage|ncb|validity|^\s*\d+(\s*\/\s*\d+)?\s*$|^\s*\d+\s*(?:-|to)\s*\d+\s*$/i;
    var age = field('Age \\(Com\\/TP\\)');
    if (age && AGE_WORD.test(age)) return read(age, true);
    var r = read(field('Discount') + ' ; ' + field('Remark'), false);
    return r;

    function read(a, ageColumn){
      // phrases that look like age but are not about the vehicle's age
      var t = a.replace(/(?:except|expect|expext|declined|excluding)?\s*new\s+mahindra/ig, ' ')
               .replace(/(?:above|upto|up\s*to)\s*\d+\s*(?:years?|yrs)\s*(?:vehicle\s*)?decline[^;|]*/ig, ' ')   // RTO decline lists, not an age limit
               .replace(/payout only for one year|tp\s*for\s*one\s*year/ig, ' ');
      var yr = ageColumn ? '' : '\\s*(?:years?|yrs)';         // in the Age column, bare numbers are years
      if (/non[\s-]*new|(?:except|excluding)\s+(?:ev\s*&\s*)?new\b/i.test(t)) return { kind:'old', stated:true };
      var isNew = /\bnew\b/i.test(t);
      var noNcbWords = /without\s+ncb|with\s+and\s+without|non[\s-]*ncb/i.test(t);
      var withNcb = !noNcbWords && (/\bwith\s+ncb\b/i.test(t) || /ncb\s*(?:above|more than|>)\s*[1-9]/i.test(t) || /(?:^|;)\s*ncb(?:\s*cases?)?(?:\s*only)?\s*(?:;|$)/i.test(t));
      var isOld = /roll\s*over|renewal|\bold\b|\d+(?:st|nd|rd|th)\s*year\s*onwards/i.test(t) || withNcb;
      var allAges = /\ball\s*ages?\b/i.test(t);
      if (isNew){
        if (isOld || allAges || /&|\band\b|\//i.test(t)) return { kind:'both', stated:true };
        return { kind:'new', stated:true };
      }
      if (isOld) return { kind:'old', stated:true };
      if (allAges) return { kind:'both', stated:true };
      var upto = ageColumn
        ? /\b(?:up\s*-?\s*to|upto|utpo|utp|less than|till the validity)\b/i
        : /\b(?:up\s*-?\s*to|upto|utpo|utp|less than)\s*\d+\s*(?:years?|yrs)|till the validity/i;
      var range = new RegExp('(?:^|\\D)([1-9]\\d*)\\s*(?:-|to)\\s*\\d+' + yr, 'i');
      var lower = new RegExp('(?:above|more than(?: or equal to)?|>)\\s*\\d+\\s*\\+?' + yr + '|\\d+' + (ageColumn ? '\\s*(?:years?|yrs)?' : yr) + '\\s*(?:above|onwards)', 'i');
      if (upto.test(t)){
        // "COMP 1 TO 20 Years SATP Upto 25" – the COMP part starts at 1 year
        if (range.test(t) && !upto.test(t.split(/SATP/i)[0])) return { kind:'old', stated:true };
        return { kind:'both', stated:true };
      }
      if (lower.test(t) || range.test(t)) return { kind:'old', stated:true };
      if (ageColumn && /^\s*[1-9]\d*\s*years?\s*$/i.test(t)) return { kind:'old', stated:true };
      if (ageColumn) return { kind:'both', stated:true };          // e.g. "15", "15/25"
      return { kind:'both', stated:false };
    }
  }
  function splitConds(rem){
    rem = rem || '';
    if (/^\(.*\)$/.test(rem) && rem.indexOf(') OR (') !== -1) return rem.slice(1, -1).split(') OR (');
    return [rem];
  }
  var ageCache = { src:null, key:'', out:null };
  function ageRecords(){
    if (showNew && showOld) return records;
    var key = (showNew ? 'n' : '') + (showOld ? 'o' : '');
    if (ageCache.src === records && ageCache.key === key) return ageCache.out;
    var out = [];
    records.forEach(function(r){
      var conds = splitConds(r.remarks);
      var keep = conds.filter(function(c){
        var k = ageInfo(c).kind;
        return k === 'both' ? (showNew || showOld) : (k === 'new' ? showNew : showOld);
      });
      if (!keep.length) return;
      if (keep.length === conds.length){ out.push(r); return; }
      var copy = {}; for (var f in r) copy[f] = r[f];
      copy.remarks = keep.length === 1 ? keep[0] : '(' + keep.join(') OR (') + ')';
      out.push(copy);
    });
    // recount ranks per state + segment over the visible rates
    var groups = {};
    out.forEach(function(r, i){ (groups[r.state + '|' + r.sec] = groups[r.state + '|' + r.sec] || []).push(i); });
    var final = out.slice();
    Object.keys(groups).forEach(function(g){
      groups[g].sort(function(x, y){ return out[x].rank - out[y].rank; });
      groups[g].forEach(function(idx, n){
        var r = out[idx];
        if (r.rank !== n){ var c = {}; for (var f in r) c[f] = r[f]; c.rank = n; final[idx] = c; }
      });
    });
    ageCache = { src:records, key:key, out:final };
    return final;
  }
  var order = VD.order; // [{key, title}], generic across states
  var states = VD.states; // [{code, name}]
  var PERIOD = openV.period || VD.periodDisplay || '';
  var VERSION = openV.version || VD.version || '';
  var PUBLISHED_MONTH = openV.month || VD.publishedMonth || '';
  var REVISION_NOTE = openV.note || '';

  var versionNoteEl = document.getElementById('version-note');
  var liveClockEl = document.getElementById('live-clock');
  var watermarkEl = document.getElementById('watermark');

  // Revision note (if any) gets its own line, in parentheses — the version number
  // itself is shown inline with the state/period line instead (see updateMasthead).
  if (versionNoteEl){
    versionNoteEl.textContent = REVISION_NOTE ? '(' + REVISION_NOTE + ')' : '';
  }

  // "DD-MMM-YYYY HH:MM:SS AM/PM", e.g. "24-Sep-2026 03:41:07 PM"
  var MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function formatDateTime(d){
    var dd = String(d.getDate()).padStart(2,'0');
    var mmm = MONTH_ABBR[d.getMonth()];
    var yyyy = d.getFullYear();
    var h = d.getHours();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    var hh = String(h12).padStart(2,'0');
    var mi = String(d.getMinutes()).padStart(2,'0');
    var ss = String(d.getSeconds()).padStart(2,'0');
    return dd + '-' + mmm + '-' + yyyy + ' ' + hh + ':' + mi + ':' + ss + ' ' + ampm;
  }
  function tickClock(){
    var now = formatDateTime(new Date());
    if (liveClockEl) liveClockEl.textContent = now;
    if (watermarkEl){
      var wmParts = [];
      if (PUBLISHED_MONTH) wmParts.push('GRID: ' + PUBLISHED_MONTH);
      wmParts.push('v' + VERSION);
      wmParts.push('as of ' + now);
      watermarkEl.textContent = wmParts.join('  ·  ');
    }
  }
  tickClock();
  try { setInterval(tickClock, 1000); } catch(e){}

  var stateSel = document.getElementById('filter-state');
  var segBtn = document.getElementById('segment-btn');
  var segPanel = document.getElementById('segment-panel');
  var segSearchInput = document.getElementById('segment-search');
  var segOptionsEl = document.getElementById('segment-options');
  var segmentCombobox = document.getElementById('segment-combobox');
  var selectedSegment = ''; // '' = no filter = all segments (single-select)
  var companyBtn = document.getElementById('company-btn');
  var companyPanel = document.getElementById('company-panel');
  var companySearchInput = document.getElementById('company-search');
  var companyOptionsEl = document.getElementById('company-options');
  var companyMultiselect = document.getElementById('company-multiselect');
  var selectedCompanies = []; // empty = no filter = all insurers
  var searchEl = document.getElementById('search');
  // The full placeholder text doesn't fit on narrow phone screens (an <input>'s
  // placeholder can't wrap to a second line no matter how small the font gets), so
  // swap in a shorter version there instead of letting it run off-screen.
  try {
    if (window.innerWidth && window.innerWidth < 400){
      searchEl.placeholder = 'Search insurer, segment, RTO — or GVW:1547';
    }
  } catch(e){}
  var resultsEl = document.getElementById('results');
  var countEl = document.getElementById('result-count');
  var placeEl = document.getElementById('place-text');

  // ---- state dropdown ----
  states.forEach(function(s){
    var opt = document.createElement('option');
    opt.value = s.code; opt.textContent = s.name;
    stateSel.appendChild(opt);
  });
  // Every page open or refresh starts with cleared filters: first state (Tamil Nadu),
  // all segments, all insurers, empty search. Nothing is remembered between visits.
  stateSel.value = states[0].code;
  searchEl.value = '';
  try { localStorage.removeItem('smartgrid_state'); localStorage.removeItem('smartgrid_q'); } catch(e){}

  function stateName(code){
    var s = states.filter(function(x){ return x.code === code; })[0];
    return s ? s.name : code;
  }

  // ---- segment / insurer dropdowns, each rebuilt from whichever OTHER filters are
  // active (state, plus each other) — so picking a segment narrows the insurer list to
  // only those that actually offer it, and picking an insurer narrows the segment list
  // the same way, rather than either just scoping to the selected state alone. ----
  function populateDependentFilters(){
    var stateFilter = stateSel.value;
    var ageRecs = ageRecords();
    var stateScoped = stateFilter ? ageRecs.filter(function(r){ return r.state === stateFilter; }) : ageRecs;

    // Segment options: scoped by state + selected insurer(s) — not by segment itself.
    var segScope = selectedCompanies.length
      ? stateScoped.filter(function(r){ return selectedCompanies.indexOf(r.company) !== -1; })
      : stateScoped;
    var segCounts = {};
    segScope.forEach(function(r){ segCounts[r.sec] = (segCounts[r.sec]||0) + 1; });
    if (selectedSegment && !segCounts[selectedSegment]) selectedSegment = '';
    var segOptions = order.filter(function(o){ return segCounts[o.key]; })
      .map(function(o){ return { value: o.key, label: o.title + ' (' + segCounts[o.key] + ')' }; });
    renderSegmentPanel(segOptions);
    updateSegmentButtonLabel();

    // Insurer options: scoped by state + selected segment — not by insurer itself.
    var compScope = selectedSegment ? stateScoped.filter(function(r){ return r.sec === selectedSegment; }) : stateScoped;
    var insurers = Array.from(new Set(compScope.map(function(r){ return r.company; })))
      .sort(function(a,b){ return a.localeCompare(b); });
    // Keep only still-valid selections when the available insurer list changes
    // (e.g. after switching state or segment) rather than silently dropping the filter.
    selectedCompanies = selectedCompanies.filter(function(c){ return insurers.indexOf(c) !== -1; });
    renderCompanyPanel(insurers);
    updateCompanyButtonLabel();
  }

  // Shared typeahead-filtering behaviour for a search box sitting above a list of
  // options inside a dropdown panel — hides options whose text doesn't match what's
  // typed, without touching the underlying selection state.
  function applyPanelFilter(searchInput, optionsEl){
    var q = searchInput.value.trim().toLowerCase();
    Array.prototype.forEach.call(optionsEl.children, function(row){
      var label = (row.textContent || '').toLowerCase();
      row.hidden = q.length > 0 && label.indexOf(q) === -1;
    });
  }
  function wirePanelSearch(searchInput, optionsEl){
    searchInput.addEventListener('input', function(){ applyPanelFilter(searchInput, optionsEl); });
  }

  // Keyboard navigation for a dropdown's option list: Down/Up move a highlighted row
  // through whatever's currently visible (i.e. respects the type-to-filter search
  // above), Enter or Space activates the highlighted row, Escape closes the panel.
  // Space is deliberately only treated as "activate" once a row is actually
  // highlighted (i.e. after at least one arrow-key press) — otherwise it types a
  // literal space, since several insurer names ("New India", "HDFC ERGO", "Go Digit",
  // "United India") need a space to search for them at all.
  // onSpaceActivate: called when Space toggles/activates the highlighted row.
  // onClose: called on Escape.
  // onEnter (optional): what Enter does. Defaults to the same thing Space does (used
  // by the single-select segment panel, where activating a row already closes the
  // panel). The multi-select insurer panel passes its own onEnter that just closes the
  // panel without toggling anything — there, Space is "pick this one, keep browsing"
  // and Enter is "I'm done, close this and let me see the results."
  // getRowKey(row): returns a stable string identifying a row (its insurer name /
  // segment value). Tracking the highlight by this KEY rather than by the row's DOM
  // element itself matters because selecting an insurer rebuilds the whole options list
  // from scratch (it has to, since the segment list needs to re-cascade) — a raw
  // element reference goes stale the instant that happens, silently breaking "the next
  // arrow press continues from the row after this one" and instead re-highlighting the
  // very first row every time, which — combined with Space toggling whatever's
  // highlighted — meant a second Down+Space actually re-toggled the FIRST selection
  // back off instead of ever reaching the second item.
  function wirePanelKeyboardNav(searchInput, optionsEl, onSpaceActivate, onClose, onEnter, getRowKey){
    var activeKey = null;
    function visibleRows(){
      return Array.prototype.filter.call(optionsEl.children, function(el){ return !el.hidden; });
    }
    function indexOfKey(rows, key){
      if (key == null) return -1;
      for (var i = 0; i < rows.length; i++){ if (getRowKey(rows[i]) === key) return i; }
      return -1;
    }
    function setActiveIndex(rows, idx){
      Array.prototype.forEach.call(optionsEl.children, function(el){ el.classList.remove('ms-active'); });
      if (idx == null || idx < 0 || idx >= rows.length){ activeKey = null; return; }
      var row = rows[idx];
      activeKey = getRowKey(row);
      row.classList.add('ms-active');
      if (row.scrollIntoView) row.scrollIntoView({ block: 'nearest' });
    }
    function moveActive(delta){
      var rows = visibleRows();
      if (!rows.length){ setActiveIndex(rows, null); return; }
      var idx = indexOfKey(rows, activeKey) + delta;
      if (idx < 0) idx = rows.length - 1;
      if (idx >= rows.length) idx = 0;
      setActiveIndex(rows, idx);
    }
    function currentActiveRow(){
      var rows = visibleRows();
      var idx = indexOfKey(rows, activeKey);
      return idx === -1 ? null : rows[idx];
    }
    // Selecting an option rebuilds the option list, and the label click moves focus onto
    // a checkbox that the rebuild then removes, leaving focus on <body> (so Esc and the
    // arrow keys stopped reaching this panel). After a keyboard selection, put focus back
    // in the search box (if the panel is still open) and re-mark the highlighted row.
    function restoreAfterActivate(){
      var panel = searchInput.closest ? searchInput.closest('.multiselect-panel') : null;
      if (panel && panel.hidden) return;
      try { searchInput.focus({ preventScroll: true }); } catch(err){ try { searchInput.focus(); } catch(e2){} }
      var rows = visibleRows(); var idx = indexOfKey(rows, activeKey);
      if (idx !== -1) rows[idx].classList.add('ms-active');
    }
    searchInput.addEventListener('keydown', function(e){
      if (e.key === 'ArrowDown'){ e.preventDefault(); moveActive(1); }
      else if (e.key === 'ArrowUp'){ e.preventDefault(); moveActive(-1); }
      else if (e.key === 'Enter'){
        e.preventDefault();
        if (onEnter) onEnter(currentActiveRow());
        else { var r = currentActiveRow(); if (r){ onSpaceActivate(r); restoreAfterActivate(); } }
      }
      else if (e.key === ' '){
        var r = currentActiveRow();
        if (r){ e.preventDefault(); onSpaceActivate(r); restoreAfterActivate(); }
        // else: let the space type normally into the search box
      }
      else if (e.key === 'Escape'){ e.preventDefault(); setActiveIndex([], null); if (onClose) onClose(); }
      else if (e.key.length === 1){ activeKey = null; } // typing a real character resets the highlight
    });
  }

  function renderSegmentPanel(segOptions){
    var html = '<div class="ms-option' + (selectedSegment ? '' : ' ms-selected') + '" data-value="">All segments</div>';
    segOptions.forEach(function(o){
      var sel = o.value === selectedSegment ? ' ms-selected' : '';
      html += '<div class="ms-option' + sel + '" data-value="' + escapeHtml(o.value) + '">' + escapeHtml(o.label) + '</div>';
    });
    segOptionsEl.innerHTML = html;
    if (segSearchInput && segSearchInput.value) applyPanelFilter(segSearchInput, segOptionsEl);
    Array.prototype.forEach.call(segOptionsEl.children, function(row){
      row.addEventListener('click', function(){
        selectedSegment = row.getAttribute('data-value');
        try { segSearchInput.value = ''; } catch(e){}
        closeSegmentPanel();
        populateDependentFilters();
        render();
        try { segBtn.focus({ preventScroll: true }); } catch(e){}
      });
    });
  }

  function updateSegmentButtonLabel(){
    if (!selectedSegment){ segBtn.textContent = 'All segments'; return; }
    var found = order.filter(function(o){ return o.key === selectedSegment; })[0];
    segBtn.textContent = found ? found.title : 'All segments';
  }

  // Clears whatever was typed last time and re-shows every row — each fresh opening of
  // a panel starts from the full list, never a search left over from a previous look.
  function resetPanelFilter(searchInput, optionsEl){
    searchInput.value = '';
    Array.prototype.forEach.call(optionsEl.children, function(row){ row.hidden = false; });
  }

  function closeSegmentPanel(){
    segPanel.hidden = true;
    segBtn.classList.remove('open');
  }
  function openSegmentPanel(){
    resetPanelFilter(segSearchInput, segOptionsEl);
    segPanel.hidden = false; segBtn.classList.add('open');
    try { segSearchInput.focus(); } catch(e){}
  }
  segBtn.addEventListener('click', function(){
    var isOpen = !segPanel.hidden;
    closeCompanyPanel();
    if (isOpen){ closeSegmentPanel(); } else { openSegmentPanel(); }
  });
  // Alt+Down is the standard shortcut to open a closed combobox/dropdown from the
  // keyboard, without first needing to click or Tab into the panel itself.
  segBtn.addEventListener('keydown', function(e){
    if (e.altKey && e.key === 'ArrowDown' && segPanel.hidden){
      e.preventDefault();
      closeCompanyPanel();
      openSegmentPanel();
    }
  });
  wirePanelSearch(segSearchInput, segOptionsEl);
  wirePanelKeyboardNav(segSearchInput, segOptionsEl, function(row){ row.click(); },
    function(){ closeSegmentPanel(); try { segBtn.focus(); } catch(e){} }, null,
    function(row){ return row.getAttribute('data-value'); });

  function renderCompanyPanel(insurers){
    var html = '';
    insurers.forEach(function(c){
      var checked = selectedCompanies.indexOf(c) !== -1 ? ' checked' : '';
      html += '<label><input type="checkbox" value="' + escapeHtml(c) + '"' + checked + '> ' + escapeHtml(c) + '</label>';
    });
    if (insurers.length){
      html += '<div class="ms-action" data-action="clear">Clear selection</div>';
    }
    companyOptionsEl.innerHTML = html;
    // Re-apply whatever is typed in the panel's search box: picking an insurer rebuilds
    // this list, and without this the full list reappeared while "kot" was still typed.
    if (companySearchInput && companySearchInput.value) applyPanelFilter(companySearchInput, companyOptionsEl);
    Array.prototype.forEach.call(companyOptionsEl.querySelectorAll('input[type="checkbox"]'), function(cb){
      cb.addEventListener('change', function(){
        var v = cb.value;
        var idx = selectedCompanies.indexOf(v);
        if (cb.checked && idx === -1) selectedCompanies.push(v);
        if (!cb.checked && idx !== -1) selectedCompanies.splice(idx, 1);
        updateCompanyButtonLabel();
        populateDependentFilters();
        render();
      });
    });
    var clearAction = companyOptionsEl.querySelector('.ms-action[data-action="clear"]');
    if (clearAction){
      clearAction.addEventListener('click', function(){
        selectedCompanies = [];
        populateDependentFilters();
        render();
      });
    }
  }

  function updateCompanyButtonLabel(){
    if (selectedCompanies.length === 0) companyBtn.textContent = 'All insurers';
    else if (selectedCompanies.length === 1) companyBtn.textContent = selectedCompanies[0];
    else companyBtn.textContent = selectedCompanies.length + ' insurers selected';
  }

  function closeCompanyPanel(){
    companyPanel.hidden = true;
    companyBtn.classList.remove('open');
  }
  function openCompanyPanel(){
    // Only the typed search text and row visibility reset here — which insurers are
    // actually checked (selectedCompanies) is the real filter and must persist.
    resetPanelFilter(companySearchInput, companyOptionsEl);
    companyPanel.hidden = false; companyBtn.classList.add('open');
    try { companySearchInput.focus(); } catch(e){}
  }
  companyBtn.addEventListener('click', function(){
    var isOpen = !companyPanel.hidden;
    closeSegmentPanel();
    if (isOpen){ closeCompanyPanel(); } else { openCompanyPanel(); }
  });
  companyBtn.addEventListener('keydown', function(e){
    if (e.altKey && e.key === 'ArrowDown' && companyPanel.hidden){
      e.preventDefault();
      closeSegmentPanel();
      openCompanyPanel();
    }
  });
  wirePanelSearch(companySearchInput, companyOptionsEl);
  wirePanelKeyboardNav(companySearchInput, companyOptionsEl, function(row){ row.click(); },
    function(){ closeCompanyPanel(); try { companyBtn.focus(); } catch(e){} },
    function(){ closeCompanyPanel(); try { companyBtn.focus(); } catch(e){} },
    function(row){ var cb = row.querySelector ? row.querySelector('input') : null; return cb ? cb.value : null; });
  // Esc closes whichever dropdown is open, wherever focus happens to be (after a mouse
  // tick on a checkbox, focus is on the checkbox or the page, not the search box).
  try {
    document.addEventListener('keydown', function(e){
      if (e.key !== 'Escape' && e.key !== 'Esc') return;
      if (!companyPanel.hidden){ e.preventDefault(); closeCompanyPanel(); try { companyBtn.focus(); } catch(x){} }
      else if (!segPanel.hidden){ e.preventDefault(); closeSegmentPanel(); try { segBtn.focus(); } catch(x){} }
    });
  } catch(e){}
  try {
    document.addEventListener('click', function(e){
      if (!companyMultiselect.contains(e.target)) closeCompanyPanel();
      if (!segmentCombobox.contains(e.target)) closeSegmentPanel();
    });
  } catch(e){}

  function updateMasthead(){
    var stateFilter = stateSel.value;
    var versionSuffix = VERSION ? ' (Version ' + VERSION + ')' : '';
    placeEl.textContent = (stateFilter ? stateName(stateFilter) + '  ·  ' : '') + PERIOD + versionSuffix;
  }

  // A light, state-appropriate background tint — subtle enough to never affect
  // readability (data-table surfaces stay crisp white regardless), just enough to
  // give each state its own quiet identity. Skipped in dark mode: forcing a pale
  // tint there would fight the dark theme and be the opposite of "not irritating".
  var STATE_BG = {
    'TN': '#FBF2DE',    // warm soft gold
    'KL': '#EAF5EC',    // soft green (Kerala's greenery)
    'KA': '#FAF6DE',    // soft warm yellow
    'AP-TS': '#FBEFE6', // soft peach
    'MH': '#EAF1FA',    // soft coastal blue
  };
  // The "best offer" highlight needs to visibly contrast against whichever state
  // background is active. TN/KA/AP-TS backgrounds sit in the same warm gold/yellow
  // family as the default gold highlight, so those three get a distinct, clearly
  // contrasting accent instead (blue / indigo / teal); KL (green) and MH (blue) already
  // contrast fine against the default gold and are left unchanged.
  var STATE_ACCENT = {
    'TN':    { gold: '#3E6FB0', goldDeep: '#1F4E86', tint: '#E3ECFA', tintStrong: '#CBDBF5' },
    'KA':    { gold: '#7A5FB0', goldDeep: '#4E3585', tint: '#EDE3FA', tintStrong: '#DCC9F2' },
    'AP-TS': { gold: '#1E8A7A', goldDeep: '#0F5C50', tint: '#DFF4F0', tintStrong: '#C2E9E1' },
  };
  function isDarkMode(){
    try {
      var t = document.documentElement.getAttribute('data-theme');
      if (t === 'dark') return true;
      if (t === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch(e){ return false; }
  }
  function applyStateBackground(){
    try {
      var ACCENT_VARS = { gold: '--gold', goldDeep: '--gold-deep', tint: '--gold-tint', tintStrong: '--gold-tint-strong' };
      if (isDarkMode()) {
        document.documentElement.style.removeProperty('--paper');
        Object.values(ACCENT_VARS).forEach(function(v){ document.documentElement.style.removeProperty(v); });
        return;
      }
      var color = STATE_BG[stateSel.value];
      if (color) {
        document.documentElement.style.setProperty('--paper', color);
      } else {
        document.documentElement.style.removeProperty('--paper'); // "All States" — neutral default
      }
      var accent = STATE_ACCENT[stateSel.value];
      if (accent) {
        document.documentElement.style.setProperty(ACCENT_VARS.gold, accent.gold);
        document.documentElement.style.setProperty(ACCENT_VARS.goldDeep, accent.goldDeep);
        document.documentElement.style.setProperty(ACCENT_VARS.tint, accent.tint);
        document.documentElement.style.setProperty(ACCENT_VARS.tintStrong, accent.tintStrong);
      } else {
        Object.values(ACCENT_VARS).forEach(function(v){ document.documentElement.style.removeProperty(v); });
      }
    } catch(e){}
  }

  populateDependentFilters();
  updateMasthead();
  applyStateBackground();

  function hasRealValue(v){
    return v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim().toUpperCase() !== 'NA';
  }

  function escapeHtml(s){
    return (s||'').replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function highlight(text, q){
    if (!q) return escapeHtml(text);
    var idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return escapeHtml(text);
    return escapeHtml(text.slice(0,idx)) + '<mark style="background:var(--gold-tint-strong);color:inherit;border-radius:2px;">' +
           escapeHtml(text.slice(idx, idx+q.length)) + '</mark>' + escapeHtml(text.slice(idx+q.length));
  }

  // Wraps any genuine RTO-decline clause in a flashing red span, and the rest of the
  // RTO field's own value in a flashing green span — so coverage (green) and exclusions
  // (red) are both impossible to miss, and never overlap even when a row has both (e.g.
  // "RTO: Doable RTO- TN01, TN02... | Declined RTO- TN29" — TN01/TN02 flash green, the
  // "Declined RTO- TN29" clause flashes red). Field labels ("Remark:", "RTO:", etc.)
  // stay plain text either way — only the actual value after the colon gets a color.
  var FIELD_LABEL_RE = /^(age\s*\([^)]*\)\s*:|discount\s*:|remark\s*:|rto\s*:)\s*/i;

  function redFlashSegments(text, q){
    // Declined/except clauses anywhere in this text get flashed red; everything else
    // is plain (search-term highlighted only). Used for the Age/Discount/Remark portion
    // of a bundle, where the RTO field's own green treatment doesn't apply.
    var matches = (text.match(DECLINE_RE) || []).map(function(s){ return s.trim(); }).filter(Boolean);
    if (!matches.length) return highlight(text, q);
    var out = '', pos = 0;
    matches.forEach(function(seg){
      var idx = text.indexOf(seg, pos);
      if (idx === -1) return;
      out += highlight(text.slice(pos, idx), q);
      var labelMatch = seg.match(FIELD_LABEL_RE);
      if (labelMatch){
        var labelLen = labelMatch[0].length;
        out += highlight(seg.slice(0, labelLen), q);
        out += '<span class="declined-flash">' + highlight(seg.slice(labelLen), q) + '</span>';
      } else {
        out += '<span class="declined-flash">' + highlight(seg, q) + '</span>';
      }
      pos = idx + seg.length;
    });
    out += highlight(text.slice(pos), q);
    return out;
  }

  function rtoFieldHtml(rtoText, q){
    // rtoText starts with "RTO:" (or similar) — split off the label, then within the
    // value, flash any declined/except sub-clause red and everything else green.
    var labelMatch = rtoText.match(FIELD_LABEL_RE);
    var label = labelMatch ? labelMatch[0] : '';
    var value = rtoText.slice(label.length);
    var out = label ? highlight(label, q) : '';
    var matches = (value.match(DECLINE_RE) || []).map(function(s){ return s.trim(); }).filter(Boolean);
    if (!matches.length){
      return out + (value ? '<span class="rto-flash">' + highlight(value, q) + '</span>' : '');
    }
    var pos = 0;
    matches.forEach(function(seg){
      var idx = value.indexOf(seg, pos);
      if (idx === -1) return;
      if (idx > pos) out += '<span class="rto-flash">' + highlight(value.slice(pos, idx), q) + '</span>';
      out += '<span class="declined-flash">' + highlight(seg, q) + '</span>';
      pos = idx + seg.length;
    });
    if (pos < value.length) out += '<span class="rto-flash">' + highlight(value.slice(pos), q) + '</span>';
    return out;
  }

  function markDeclined(text, q){
    var rtoIdx = text.search(/\bRTO\s*:/i);
    if (rtoIdx === -1) return redFlashSegments(text, q);
    var before = text.slice(0, rtoIdx);
    var rtoPart = text.slice(rtoIdx);
    return redFlashSegments(before, q) + rtoFieldHtml(rtoPart, q);
  }

  // A remarks string with more than one distinct condition bundle is joined with the
  // literal " OR " separator (see build_json2.py). Split those back apart so each full
  // condition reads as its own line, with a centered "OR" between them, instead of one
  // long run-on line that's hard to parse at a glance.
  // A promotional offer attached to a rate (manual correction), shown as its own branded badge.
  function offerHtml(r, q){
    var o = r && r.offer; if (!o) return '';
    var title = typeof o === 'string' ? '' : (o.title || '');
    var text = typeof o === 'string' ? o : (o.text || '');
    return '<div class="offer-badge" role="note"><span class="offer-bolt" aria-hidden="true">\u26A1</span><span>' +
      (title ? '<b class="offer-title">' + highlight(title, q) + '</b>' : '') +
      '<span class="offer-text">' + highlight(text, q) + '</span></span></div>';
  }
  // A condition with no age wording anywhere applies to every vehicle age: say so.
  function withAgeLabel(b){
    if (!AGE_FILTER_ON) return b;
    if (!b || !b.trim()) return 'Age (Com/TP): All ages';
    if (/Age \(Com\/TP\):/.test(b) || ageInfo(b).stated) return b;
    return 'Age (Com/TP): All ages | ' + b;
  }
  function formatRemarks(text, q){
    if (text.indexOf(' OR (') === -1){
      return markDeclined(withAgeLabel(text), q);
    }
    var bundles = text.split(' OR ').map(function(b){
      return b.replace(/^\(/, '').replace(/\)$/, '');
    });
    return bundles.map(function(b){
      return '<div class="remark-bundle">' + markDeclined(withAgeLabel(b), q) + '</div>';
    }).join('<div class="remark-or">OR</div>');
  }

  var WEIGHT_SECTIONS = new Set(['LCV Upto 2000','LCV 2001 to 3500','LCV 3501 to 7500',
    'MCV 7501 to 12000','MCV 12001 to 20000','HCV 20000 to 40000','HCV Above 40000','HCV Flat Bed']);

  // Parse a "GCW: 1547" / "GVW 1547" style query into a target weight number.
  function parseWeightQuery(q){
    var m = q.match(/\b(?:gcw|gvw)\b\s*:?\s*(\d[\d,]*)/i);
    if (!m) return null;
    var n = parseFloat(m[1].replace(/,/g,''));
    return isNaN(n) ? null : n;
  }

  // A search like "taxi 6+1" / "TAXI(6+1)" / "taxi (6+1)" should match wherever "taxi"
  // and that seat notation both appear — even when they're not directly adjacent in the
  // segment text (e.g. SBI's "TAXI (Only Seating 6+1)" has words in between). Returns
  // "4+1"/"5+1"/"6+1" when the query names both a taxi and a seat count, else null.
  function parseTaxiSeatQuery(qRaw){
    if (!/taxi/i.test(qRaw)) return null;
    var m = qRaw.match(/\(?\s*([456])\s*\+\s*1\s*\)?/);
    return m ? (m[1] + '+1') : null;
  }

  // Confirmed by the user: these insurers' "TAXI Upto 6" tier (National's "TAXI UPTO 6
  // SEATS", Oriental's and United India's "TAXI UPTO 6") counts 6 as the PASSENGER
  // total — i.e. 6 + the driver's own seat = a 6+1 seater — unlike IFFCO's "Upto 6",
  // which is a 2-to-6 seat range and does not mean the same thing. New India's own
  // segment for this tier is recorded as bare "Taxi" with no seat count at all in the
  // source data; it's included here per the user's explicit instruction, but is worth
  // reconfirming against source data if this ever needs revisiting. If any of these
  // insurers' wording for this tier changes in a future data file, confirm with the
  // user before assuming the same treatment still applies — this is a specific,
  // already-confirmed mapping, not a standing rule to extend on assumption.
  var TAXI_UPTO6_AS_6PLUS1_COMPANIES = { 'Oriental': 1, 'National': 1, 'United India': 1, 'New India': 1 };
  function isTaxiUpto6As6Plus1(company, segment){
    if (!TAXI_UPTO6_AS_6PLUS1_COMPANIES[company]) return false;
    var s = String(segment).trim().toUpperCase();
    if (company === 'New India') return s === 'TAXI';
    // The narrow "Upto 6" tier specifically — not a wider range like "Upto 6 to 17".
    return /^TAXI\s*UPTO\s*6(\s*SEATS)?$/.test(s);
  }

  // Confirmed: IFFCO's Tamil Nadu "Taxi (2 to 6 seats)" segment is treated as covering
  // the 4+1 and 5+1 seating searches specifically (not 6+1, which belongs to the
  // insurers above) — a 2-to-6 seat range spans both a 4-passenger and a 5-passenger
  // configuration, but IFFCO's own "Upto 6" wording doesn't correspond to the same
  // "6 passengers + driver" convention the other insurers use for their 6+1 tier.
  function isIffcoTaxi2to6(company, segment){
    return company === 'IFFCO' && String(segment).trim().toLowerCase() === 'taxi (2 to 6 seats)';
  }

  // Does this text contain the given seat notation ("6+1" etc.), allowing for optional
  // parentheses/spacing around it — "(6+1)", "6+1", "6 + 1" all count.
  function hasSeatToken(text, seat){
    var digit = seat.charAt(0);
    var re = new RegExp('\\(?\\s*' + digit + '\\s*\\+\\s*1\\s*\\)?', 'i');
    return re.test(text);
  }

  // Read the numeric GVW range a segment's own text describes, e.g. "Upto 2000" -> [0,2000],
  // "2001 to 3500" -> [2001,3500], "Above 7501" -> [7501, Infinity]. Wheeler-count tokens
  // like "3W" are stripped first so they're never mistaken for a weight figure.
  function weightRangeOf(text){
    // Parenthetical qualifiers like "(without CPA less 1%)" or "(Excluding 3W Auto)"
    // often contain unrelated numbers ("1%", "3W") that must never be mistaken for
    // part of the GVW range — strip them before extracting any numbers.
    var noParens = text.replace(/\([^)]*\)/g, ' ');
    var cleaned = noParens.replace(/\d+\s*w\b/gi, ' ');
    var nums = (cleaned.match(/\d[\d,]*(?:\.\d+)?/g) || []).map(function(s){ return parseFloat(s.replace(/,/g,'')); });
    if (!nums.length) return null;
    var hasAbove = /above/i.test(text);
    if (nums.length === 1){
      return hasAbove ? {min: nums[0], max: Infinity} : {min: 0, max: nums[0]};
    }
    return {min: Math.min.apply(null, nums), max: Math.max.apply(null, nums)};
  }

  // Normalizes known synonym/spacing variants before comparing search text, so
  // "Agri Tractor" and "Agriculture Tractor" are treated as the same term, and
  // "Private Car"/"private-car"/"privatecar" (similarly "Two Wheeler") all match
  // regardless of spacing or hyphenation — without affecting any other search text.
  function normalizeQuery(s){
    return String(s).toLowerCase()
      .replace(/agricultur\w*/g, 'agri')
      .replace(/private[\s-]*car/g, 'privatecar')
      .replace(/two[\s-]*wheeler/g, 'twowheeler');
  }
  // Same normalization, PLUS strips "other than X" clauses entirely, so a negated
  // mention in a row's own text (e.g. "Misc-D - Other than Agricultural Tractor", or
  // a segment literally labeled "Other than agri tractor") never counts as a match —
  // it explicitly EXCLUDES that term, so it shouldn't surface in that search. This
  // must only ever apply to the row's text being searched, NEVER to the user's own
  // typed query — if someone actually searches "Other than Ambulance", stripping
  // their own query the same way would leave nothing to match against and (since an
  // empty string is a substring of everything) wrongly return every single row.
  function normalizeHaystack(s){
    return normalizeQuery(String(s).toLowerCase().replace(/other\s+than\s+[^|,]*/g, ' '));
  }

  var ALL_RTO_PATTERN = /all\s+(?:tn\s+|south\s+state\s+)?rtos?\b/i;
  var RTO_CODE_PATTERN = /^(tn|py)\s*-?\s*\d+$/i;
  var PLACE_WORDS = /\b(rto|tn|py|ka|kl|ap|ts|mh|chennai|coimbatore|bangalore|bengaluru|pondicherry|hyderabad|mumbai|pune|nagpur|aurangabad|kerala|karnataka|telangana|andhra|maharashtra)\b/i;

  // Finds the clause(s) within a remarks string that actually describe an RTO being
  // excluded — either via "Declined RTO - TN29, TN52" / "(TN19 Declined)", or via
  // "All South State RTOs, except KL" / "All TN RTO EXCEPT CHENNAI" / "(EXCEPT MUMBAI &
  // PUNE)". Both phrasings mean the same thing (that RTO/zone isn't covered).
  //
  // This must stay distinct from unrelated exclusions that aren't about RTOs at all —
  // "EV DECLINE" (fuel-type), "Except All EV Vehicle", "Except Mahindra bolero", or even
  // "Mumbai RTO Except Bolero" (a vehicle-make exception that just happens to sit next to
  // an RTO mention). To tell these apart: text inside the RTO: field itself is always
  // treated as RTO-related (no further check needed, since by definition that field IS
  // about RTOs — this catches nested parentheticals like "(EXCEPT MUMBAI & PUNE)" that
  // don't repeat the word "RTO" themselves). Anywhere else (Age/Discount/Remark), a
  // decline/except clause only counts if it independently references an RTO or RTO code,
  // and for "except" specifically, what follows the word must look like a place — not a
  // vehicle make/model — to avoid "Mumbai RTO Except Bolero" being misread as an RTO
  // exclusion when it's actually excluding a vehicle model.
  // A clause stops at a field separator (|), a bracket, or the end of a sentence
  // (". "), so e.g. "Declined New Mahindra. Doable Hazardous category - ..." flags only
  // the declined sentence, never the doable list after it. Decimals (2.5) don't split.
  var DECLINE_RE = /\(?(?:[^|().]|\.(?!\s))*\b(?:declin\w*|except\w*)\b(?:[^|().]|\.(?!\s))*\)?/gi;
  function findDeclinedSegments(text){
    // Bundled multi-condition remarks are joined with " OR (...)" (see build_json2.py) —
    // check each condition bundle on its own so an RTO: field from one condition is
    // never confused with a Remark field from a different condition.
    var bundles = text.indexOf(' OR (') !== -1
      ? text.split(' OR ').map(function(b){ return b.replace(/^\(/, '').replace(/\)$/, ''); })
      : [text];
    var results = [];
    bundles.forEach(function(bundle){
      var rtoIdx = bundle.search(/\bRTO\s*:/i);
      var beforeRto = rtoIdx === -1 ? bundle : bundle.slice(0, rtoIdx);
      var rtoPart = rtoIdx === -1 ? '' : bundle.slice(rtoIdx);
      if (rtoPart && /\b(declin\w*|except\w*)\b/i.test(rtoPart)) {
        (rtoPart.match(DECLINE_RE) || []).forEach(function(s){ results.push(s.trim()); });
      }
      if (beforeRto) {
        (beforeRto.match(DECLINE_RE) || []).forEach(function(seg){
          seg = seg.trim();
          if (!seg) return;
          if (/declin\w*\s*(ev|model|vehicle)\b/i.test(seg)) return;
          var hasRtoContext = /\brto\b/i.test(seg) || /\b(tn|py|ka|kl|ap|mh)\d+\b/i.test(seg);
          if (!hasRtoContext) return;
          var exceptMatch = seg.match(/except\w*\b([\s\S]*)$/i);
          if (exceptMatch && !/declin/i.test(seg)) {
            var after = exceptMatch[1];
            var afterLooksLikePlace = PLACE_WORDS.test(after) || /\b(tn|py|ka|kl|ap|mh)\d+\b/i.test(after);
            if (!afterLooksLikePlace) return;
          }
          results.push(seg);
        });
      }
    });
    return results;
  }
  function isRtoDeclined(remarks, code){
    var codeRe = new RegExp('\\b' + code.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\b', 'i');
    return findDeclinedSegments(remarks).some(function(seg){ return codeRe.test(seg); });
  }

  // For visual highlighting (not the RTO-code search-exclusion above), ANY decline or
  // exception is worth flagging — including vehicle make/model ones like "BHARAT BENZ
  // DECLINED" or "Except Mahindra bolero" — since those are important exclusions a
  // reader should notice at a glance, even though they're irrelevant to whether a
  // specific RTO code is covered.
  function findHighlightSegments(text){
    var matches = text.match(DECLINE_RE) || [];
    return matches.map(function(s){ return s.trim(); }).filter(function(s){ return s; });
  }

  function parseLeadingNumber(str){
    if (!str) return -Infinity;
    var m = String(str).match(/[\d.]+/);
    return m ? parseFloat(m[0]) : -Infinity;
  }

  // For a GVW/GCW search, the point is to see the single best commission across every
  // matching segment at a glance — so this renders one flat list ranked by actual
  // payout value, highest first, rather than grouping matches by their original section
  // (which would keep each section's own internal order instead of a true cross-segment
  // ranking).
  function renderWeightRankedList(rows, q, weightQuery, showState){
    var ranked = rows.slice().sort(function(a,b){
      return parseLeadingNumber(b.package) - parseLeadingNumber(a.package);
    });
    var html = '<div class="section-group">';
    html += '<div class="section-head"><h2>Highest commission first — GVW ' + weightQuery.toLocaleString() + ' kg</h2><span class="count">' + ranked.length + ' matching segments</span></div>';
    html += '<table><thead><tr>' +
      (showState ? '<th style="width:10%">State</th>' : '') +
      '<th style="width:16%">Insurer</th><th style="width:'+(showState?'40%':'44%')+'">Segment</th>' +
      '<th class="num" style="width:10%">Package</th><th class="num" style="width:10%">TP</th></tr></thead><tbody>';
    var colspan = showState ? 5 : 4;
    ranked.forEach(function(r, idx){
      var isBest = idx < 3;
      var cls = isBest ? 'best rank' + idx : '';
      // The "best" badge belongs on whichever of Package/TP is the row's actual leading
      // figure — if Package is NA (and this isn't a single-payout row where TP is just
      // "—" anyway), the payout driving its rank is the TP value, so the badge goes there.
      var pkgIsBest = idx===0 && (r.single || hasRealValue(r.package));
      var tpIsBest = idx===0 && !r.single && !pkgIsBest && hasRealValue(r.tp);
      var pkgHtml = '<td class="rate pkg">' + escapeHtml(r.package||'NA') + (pkgIsBest?'<span class="badge">BEST</span>':'') + '</td>';
      var tpHtml = '<td class="rate">' + escapeHtml(r.single ? '—' : (r.tp||'NA')) + (tpIsBest?'<span class="badge">BEST</span>':'') + '</td>';
      html += '<tr class="fields-row '+cls+'">' +
        (showState ? '<td class="company">' + escapeHtml(stateName(r.state)) + '</td>' : '') +
        '<td class="company">' + highlight(r.company, q) + '</td>' +
        '<td class="segment">' + highlight(r.segment, q) + '</td>' +
        pkgHtml + tpHtml +
        '</tr>';
      html += '<tr class="remarks-row '+cls+'">' +
        '<td class="remarks" colspan="'+colspan+'">' + formatRemarks(r.remarks, q) + offerHtml(r, q) + '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';

    // Mobile card fallback — the desktop <table> above is hidden below the responsive
    // breakpoint (see @media max-width:760px), so without this, a weight/GVW search on
    // mobile would render the "N matching segments" header with nothing underneath it.
    html += '<div class="cards">';
    ranked.forEach(function(r, idx){
      var isBest = idx < 3;
      var cls = isBest ? 'best rank' + idx : '';
      var rateStr = r.single ? (r.package||'NA') : ((r.package||'NA') + (r.tp ? ' / TP ' + r.tp : ''));
      html += '<div class="card '+cls+'">' +
        '<div class="card-top"><div class="card-company">' + highlight(r.company, q) + (idx===0?'<span class="badge">BEST</span>':'') + '</div>' +
        '<div class="card-rate">' + escapeHtml(rateStr) + '</div></div>' +
        '<div class="card-segment">' + (showState ? escapeHtml(stateName(r.state)) + ' — ' : '') + highlight(r.segment, q) + '</div>' +
        '<div class="card-remarks">' + formatRemarks(r.remarks, q) + offerHtml(r, q) + '</div>' +
        '</div>';
    });
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderSectionGroup(o, rows, totalForSection, q){
    var html = '';
    html += '<div class="section-group">';
    html += '<div class="section-head"><h2>' + escapeHtml(o.title) + '</h2><span class="count">' + rows.length + ' of ' + totalForSection + '</span></div>';

    var isSingle = rows.length && rows[0].single;
    // Remarks is no longer a narrow side column — it gets its own full-width row right
    // under each record's compact fields, so a long remark no longer forces Insurer/
    // Segment/Package/TP to sit stretched-tall with empty space beside it. This roughly
    // halves the vertical space most records take, fitting far more of them on screen.
    var headHtml = isSingle
      ? '<th style="width:18%">Insurer</th><th style="width:52%">Segment</th><th class="num" style="width:30%">Payout</th>'
      : '<th style="width:16%">Insurer</th><th style="width:44%">Segment</th><th class="num" style="width:20%">Package</th><th class="num" style="width:20%">TP</th>';
    var colspan = isSingle ? 3 : 4;
    html += '<table><thead><tr>' + headHtml + '</tr></thead><tbody>';
    rows.forEach(function(r){
      var isBest = r.rank < 3;
      var cls = isBest ? 'best rank' + r.rank : '';
      var pkgHtml, tpHtml;
      if (r.single){
        pkgHtml = '<td class="rate pkg">' + escapeHtml(r.package||'NA') + (r.rank===0?'<span class="badge">BEST</span>':'') + '</td>';
        tpHtml = '';
      } else {
        // The "best" badge belongs on whichever of Package/TP is the row's actual
        // leading figure — if Package is NA, the payout driving its rank is the TP
        // value instead, so the badge must appear there, not next to "NA".
        var pkgIsBest = r.rank===0 && hasRealValue(r.package);
        var tpIsBest = r.rank===0 && !pkgIsBest && hasRealValue(r.tp);
        pkgHtml = '<td class="rate pkg">' + escapeHtml(r.package||'NA') + (pkgIsBest?'<span class="badge">BEST</span>':'') + '</td>';
        tpHtml = '<td class="rate">' + escapeHtml(r.tp||'NA') + (tpIsBest?'<span class="badge">BEST</span>':'') + '</td>';
      }
      html += '<tr class="fields-row '+cls+'">' +
        '<td class="company">' + highlight(r.company, q) + '</td>' +
        '<td class="segment">' + highlight(r.segment, q) + '</td>' +
        pkgHtml + tpHtml +
        '</tr>';
      html += '<tr class="remarks-row '+cls+'">' +
        '<td class="remarks" colspan="'+colspan+'">' + formatRemarks(r.remarks, q) + offerHtml(r, q) + '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';

    html += '<div class="cards">';
    rows.forEach(function(r){
      var isBest = r.rank < 3;
      var cls = isBest ? 'best rank' + r.rank : '';
      var rateStr = r.single ? (r.package||'NA') : ((r.package||'NA') + (r.tp ? ' / TP ' + r.tp : ''));
      html += '<div class="card '+cls+'">' +
        '<div class="card-top"><div class="card-company">' + highlight(r.company, q) + (r.rank===0?'<span class="badge">BEST</span>':'') + '</div>' +
        '<div class="card-rate">' + escapeHtml(rateStr) + '</div></div>' +
        '<div class="card-segment">' + highlight(r.segment, q) + '</div>' +
        '<div class="card-remarks">' + formatRemarks(r.remarks, q) + offerHtml(r, q) + '</div>' +
        '</div>';
    });
    html += '</div>';
    html += '</div>';
    return html;
  }

  function render(){
    var qRaw = searchEl.value.trim();
    var q = qRaw.toLowerCase();
    var stateFilter = stateSel.value;
    var segFilter = selectedSegment;
    var compFilter = selectedCompanies; // array — empty means "all insurers"
    var weightQuery = parseWeightQuery(qRaw);
    var isRtoCodeQuery = RTO_CODE_PATTERN.test(qRaw);
    var normRtoCode = isRtoCodeQuery ? qRaw.replace(/[\s-]/g,'').toUpperCase() : null;
    var taxiSeatQuery = parseTaxiSeatQuery(qRaw);

    // Totals for the "X of Y" count in each section header — scoped to the selected
    // state (if any) but NOT to search/company, so it reflects "how many total" for
    // that state's segment, independent of the current search.
    var ageRecs = ageRecords();
    var stateScoped = stateFilter ? ageRecs.filter(function(r){ return r.state === stateFilter; }) : ageRecs;
    var sectionTotals = {}; // key: state|sec
    stateScoped.forEach(function(r){
      var k = r.state + '|' + r.sec;
      sectionTotals[k] = (sectionTotals[k]||0) + 1;
    });

    var filtered = ageRecs.filter(function(r){
      if (stateFilter && r.state !== stateFilter) return false;
      if (segFilter && r.sec !== segFilter) return false;
      if (compFilter.length && compFilter.indexOf(r.company) === -1) return false;
      if (weightQuery !== null){
        if (!WEIGHT_SECTIONS.has(r.sec)) return false;
        var range = weightRangeOf(r.segment);
        if (!range) return false;
        return weightQuery >= range.min && weightQuery <= range.max;
      }
      if (q){
        // A row that explicitly declines the searched RTO pays nothing there — never
        // show it as a result for that RTO, no matter how else it might match.
        if (isRtoCodeQuery && isRtoDeclined(r.remarks, normRtoCode)) return false;
        var hay = normalizeHaystack(r.company + ' ' + r.title + ' ' + r.segment + ' ' + r.remarks + (r.offer ? ' ' + (r.offer.title || '') + ' ' + (r.offer.text || r.offer) : ''));
        var textMatch = hay.indexOf(normalizeQuery(q)) !== -1;
        // A specific RTO code search (e.g. "TN07") should also surface rows scoped to
        // "All RTO(s)" / "All TN RTO(s)" — those blanket-cover every RTO, including the
        // one searched for, even though the code itself never appears in that row's text.
        var blanketMatch = isRtoCodeQuery && ALL_RTO_PATTERN.test(r.remarks);
        // A "taxi N+1" search matches wherever "taxi" and that seat notation both
        // appear (not necessarily adjacent), plus the specific confirmed insurer
        // tiers that mean the same seating capacity despite being worded differently.
        var taxiSeatMatch = false;
        if (taxiSeatQuery){
          var seg = r.segment || '';
          var directSeatMatch = /taxi/i.test(seg) && hasSeatToken(seg, taxiSeatQuery);
          var specialMatch = taxiSeatQuery === '6+1'
            ? isTaxiUpto6As6Plus1(r.company, seg)
            : isIffcoTaxi2to6(r.company, seg);
          taxiSeatMatch = directSeatMatch || specialMatch;
        }
        if (!textMatch && !blanketMatch && !taxiSeatMatch) return false;
      }
      return true;
    });

    // A rate written for a wide weight range (e.g. IFFCO "0 To 40000") is filed under
    // every LCV/MCV/HCV band it overlaps, which is right when browsing by band. A GVW
    // search pulls all bands together, so keep each distinct rate (same state, insurer,
    // segment, payouts and conditions) only once.
    if (weightQuery !== null){
      var seenGvw = {};
      filtered = filtered.filter(function(r){
        var k = [r.state, r.company, r.segment, r.package, r.tp, r.remarks].join('\u0001');
        if (seenGvw[k]) return false;
        seenGvw[k] = true;
        return true;
      });
    }

    if (weightQuery !== null){
      countEl.innerHTML = '<b>' + filtered.length + '</b> segments cover a GVW of <b>' + weightQuery.toLocaleString() + '</b> kg';
    } else {
      var allInState = stateFilter ? records.filter(function(r){ return r.state === stateFilter; }).length : records.length;
      countEl.innerHTML = '<b>' + filtered.length + '</b> of ' + allInState + ' rates shown' +
        ((showNew && showOld) ? '' : (showNew ? ' \u00B7 New vehicles' : ' \u00B7 Rollover / Renewal'));
    }

    if (filtered.length === 0){
      var emptyMsg = weightQuery !== null
        ? 'No LCV/MCV/HCV segment covers a GVW of ' + weightQuery.toLocaleString() + ' kg.'
        : 'Try a different insurer, segment, or search term.';
      resultsEl.innerHTML = '<div class="empty"><h3>No matching rates</h3><div>' + emptyMsg + '</div></div>';
      return;
    }

    var html = '';

    if (weightQuery !== null){
      html = renderWeightRankedList(filtered, q, weightQuery, !stateFilter);
      resultsEl.innerHTML = html;
      try { updateCurrentSectionLabel(); } catch(e){}
      return;
    }

    function sortRows(rows){
      return rows.slice().sort(function(a,b){ return a.rank - b.rank; });
    }

    if (stateFilter){
      // Single state in scope — group by segment only, same as before.
      var bySec = {};
      filtered.forEach(function(r){ (bySec[r.sec] = bySec[r.sec] || []).push(r); });
      order.forEach(function(o){
        var rows = bySec[o.key];
        if (!rows || !rows.length) return;
        var total = sectionTotals[stateFilter + '|' + o.key] || rows.length;
        html += renderSectionGroup(o, sortRows(rows), total, q);
      });
    } else {
      // "All States" — group by state first, then by segment within each state, so
      // insurers from different states are never mixed under one heading.
      var byState = {};
      filtered.forEach(function(r){ (byState[r.state] = byState[r.state] || []).push(r); });
      states.forEach(function(s){
        var stateRows = byState[s.code];
        if (!stateRows || !stateRows.length) return;
        html += '<div class="state-group"><h2 class="state-heading">' + escapeHtml(s.name) + '</h2>';
        var bySec = {};
        stateRows.forEach(function(r){ (bySec[r.sec] = bySec[r.sec] || []).push(r); });
        order.forEach(function(o){
          var rows = bySec[o.key];
          if (!rows || !rows.length) return;
          var total = sectionTotals[s.code + '|' + o.key] || rows.length;
          html += renderSectionGroup(o, sortRows(rows), total, q);
        });
        html += '</div>';
      });
    }

    resultsEl.innerHTML = html;
    try { updateCurrentSectionLabel(); } catch(e){}
  }

  var debounceTimer;
  searchEl.addEventListener('input', function(){
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, 120);
  });
  stateSel.addEventListener('change', function(){
    populateDependentFilters();
    updateMasthead();
    applyStateBackground();
    render();
  });
  var ageSeg = document.getElementById('age-seg');
  if (ageSeg && AGE_FILTER_ON) ageSeg.hidden = false;
  var ageOpts = ageSeg ? Array.prototype.slice.call(ageSeg.querySelectorAll('.age-opt')) : [];
  var ageThumb = ageSeg ? ageSeg.querySelector('.thumb') : null;
  function ageMode(){ return showNew && showOld ? 'both' : (showNew ? 'new' : 'old'); }
  function paintAge(){
    var mode = ageMode();
    if (ageSeg) ageSeg.setAttribute('data-mode', mode);
    ageOpts.forEach(function(b){
      var on = b.getAttribute('data-age') === mode;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      if (on && ageThumb){ ageThumb.style.width = b.offsetWidth + 'px'; ageThumb.style.transform = 'translateX(' + (b.offsetLeft - 3) + 'px)'; }
    });
  }
  function setAge(mode){
    showNew = mode !== 'old'; showOld = mode !== 'new';
    paintAge(); populateDependentFilters(); render(); syncControlsHeight();
  }
  ageOpts.forEach(function(b, i){
    b.addEventListener('click', function(){ if (b.getAttribute('data-age') !== ageMode()) setAge(b.getAttribute('data-age')); });
    b.addEventListener('keydown', function(e){
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0);
      if (!d) return;
      e.preventDefault();
      var n = ageOpts[Math.max(0, Math.min(ageOpts.length - 1, i + d))];
      n.focus(); setAge(n.getAttribute('data-age'));
    });
  });
  paintAge();
  try { window.addEventListener('resize', paintAge); } catch(e){}
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintAge);
  document.getElementById('clear-btn').addEventListener('click', function(){
    searchEl.value = ''; selectedSegment = '';
    showNew = true; showOld = true; paintAge();   // vehicle age back to Both
    selectedCompanies = [];
    populateDependentFilters();
    updateMasthead();
    applyStateBackground();
    render();
  });

  // Coming back with the browser's Back button can show the page from memory with old
  // filters still set: clear them the same way.
  try {
    window.addEventListener('pageshow', function(e){
      if (e.persisted){ stateSel.value = states[0].code; document.getElementById('clear-btn').click(); }
    });
  } catch(e){}

  // Keep the table's column header pinned just below the sticky search/filter bar as
  // the user scrolls — measure the bar's real rendered height (it can vary, e.g. when
  // it wraps onto more lines on a narrow screen) rather than assuming a fixed value.
  function syncControlsHeight(){
    try {
      var bar = document.getElementById('controls-bar');
      if (bar && bar.offsetHeight) {
        document.documentElement.style.setProperty('--controls-height', bar.offsetHeight + 'px');
      }
    } catch(e){}
  }
  syncControlsHeight();
  try { window.addEventListener('resize', syncControlsHeight); } catch(e){}

  // While scrolling through a long list of results, show which segment/section is
  // currently in view (in the same spot the "X of Y rates shown" count normally sits)
  // instead of the generic count — restoring the count once scrolled back to the top.
  var currentSectionEl = document.getElementById('current-section-label');
  function updateCurrentSectionLabel(){
    try {
      var bar = document.getElementById('controls-bar');
      var barBottom = bar ? bar.getBoundingClientRect().bottom : 0;
      var heads = document.querySelectorAll('.section-head h2');
      var current = null;
      for (var i = 0; i < heads.length; i++){
        var rect = heads[i].getBoundingClientRect();
        if (rect.top <= barBottom + 4){ current = heads[i]; } else { break; }
      }
      if (current){
        currentSectionEl.textContent = current.textContent;
        currentSectionEl.hidden = false;
        countEl.hidden = true;
      } else {
        currentSectionEl.hidden = true;
        countEl.hidden = false;
      }
    } catch(e){}
  }
  var scrollTicking = false;
  try {
    window.addEventListener('scroll', function(){
      if (scrollTicking) return;
      scrollTicking = true;
      (window.requestAnimationFrame || function(f){ setTimeout(f, 16); })(function(){
        updateCurrentSectionLabel();
        scrollTicking = false;
      });
    });
  } catch(e){}

  // ---- Version bar: months newest first, versions in order within each month.
  // The filters above stay as they are; switching version re-applies them to that version's rates.
  var vBar = document.getElementById('version-bar');
  var vOpen = document.getElementById('version-open');
  var vOpenName = document.getElementById('version-open-name');
  var vOpenChip = document.getElementById('version-open-chip');
  var vTag = document.getElementById('open-version-tag');
  var STATE_LABEL = { current:'Applies today', earlier:'Earlier', upcoming:'Upcoming' };
  var vButtons = [];
  var vMonthSel = null, vList = null;
  function chip(el, v){
    var st = versionState(v);
    el.className = 'vchip ' + st;
    el.textContent = STATE_LABEL[st];
  }
  // Months in a dropdown (newest first); the chosen month's versions sit beside it on one line.
  // Versions that have not started yet are not shown.
  function shownVersions(){ return VERS.filter(function(v){ return versionState(v) !== 'upcoming' || v === openVersion; }); }
  function monthsOf(list){
    var ms = [];
    list.forEach(function(v){ if (ms.indexOf(v.month) === -1) ms.push(v.month); });
    return ms.reverse();
  }
  function renderVersionList(month){
    vList.textContent = ''; vButtons = [];
    shownVersions().filter(function(v){ return v.month === month; }).forEach(function(v){
      var b = document.createElement('button'); b.type = 'button'; b.className = 'vbtn';
      b.setAttribute('aria-label', v.label); b.title = v.label;
      var t = document.createElement('span'); t.className = 'vb-v'; t.textContent = 'Version ' + v.version;
      // Short dates (dd-Mon, e.g. 01-Oct): the month dropdown already carries the year.
      var d = document.createElement('span'); d.className = 'vb-d';
      d.textContent = (v.dates || '').replace(/(\d{2})-(\d{2})-\d{4}/g, function(_, dd, mm){ return dd + '-' + (MONTH_ABBR[+mm - 1] || mm); });
      var c = document.createElement('span'); chip(c, v);
      b.appendChild(t); b.appendChild(d); b.appendChild(c);
      b.addEventListener('click', function(){ switchVersion(v); });
      b._v = v; vButtons.push(b); vList.appendChild(b);
    });
    vButtons.forEach(function(b){ b.setAttribute('aria-pressed', b._v === openVersion ? 'true' : 'false'); });
  }
  function renderVersionBar(){
    if (!vBar || !VERS[0].label) return;
    vBar.textContent = '';
    var lab = document.createElement('label'); lab.className = 'vb-month-label'; lab.htmlFor = 'version-month'; lab.textContent = 'GRID month';
    vMonthSel = document.createElement('select'); vMonthSel.id = 'version-month'; vMonthSel.className = 'vb-month-select';
    monthsOf(shownVersions()).forEach(function(m){
      var o = document.createElement('option'); o.value = m; o.textContent = m; vMonthSel.appendChild(o);
    });
    vMonthSel.value = openVersion.month;
    vList = document.createElement('div'); vList.className = 'vb-list'; vList.setAttribute('role', 'group'); vList.setAttribute('aria-label', 'Versions');
    vMonthSel.addEventListener('change', function(){
      var m = vMonthSel.value;
      renderVersionList(m);
      // Open that month's version: the one applying today if any, else its last version.
      var vs = shownVersions().filter(function(v){ return v.month === m; });
      var pick = vs.filter(function(v){ return versionState(v) === 'current'; }).pop() || vs[vs.length - 1];
      if (pick) switchVersion(pick);
    });
    vBar.appendChild(lab); vBar.appendChild(vMonthSel); vBar.appendChild(vList);
    renderVersionList(openVersion.month);
    vBar.hidden = false;
  }
  function updateVersionUI(){
    if (vMonthSel && vMonthSel.value !== openVersion.month){ vMonthSel.value = openVersion.month; renderVersionList(openVersion.month); }
    vButtons.forEach(function(b){ b.setAttribute('aria-pressed', b._v === openVersion ? 'true' : 'false'); });
    if (vOpen && openVersion.label){
      vOpenName.textContent = '\u25BE ' + openVersion.name + ' - ';
      var dd = document.createElement('span'); dd.style.whiteSpace = 'nowrap'; dd.textContent = openVersion.dates || '';
      vOpenName.appendChild(dd);
      chip(vOpenChip, openVersion);
      vOpen.hidden = false;
    }
    if (vTag) vTag.textContent = openVersion.label ? (openVersion.month + ' \u00B7 Version ' + openVersion.version) : '';
    if (versionNoteEl) versionNoteEl.textContent = REVISION_NOTE ? '(' + REVISION_NOTE + ')' : '';
  }
  var switchToken = 0;
  function switchVersion(v){
    if (v === openVersion) return;
    var token = ++switchToken;
    vButtons.forEach(function(b){ b.setAttribute('aria-pressed', b._v === v ? 'true' : 'false'); });
    resultsEl.innerHTML = '';
    var wait = document.createElement('div'); wait.className = 'empty';
    var h = document.createElement('h3'); h.textContent = 'Loading ' + v.label + '…'; wait.appendChild(h);
    resultsEl.appendChild(wait);
    loadVersion(v).then(function(d){
      if (token !== switchToken) return;
      openVersion = v;
      records = d.records; order = d.order; states = d.states;
      PERIOD = v.period || ''; VERSION = v.version || ''; PUBLISHED_MONTH = v.month || ''; REVISION_NOTE = v.note || '';
      var keep = stateSel.value;
      stateSel.textContent = '';
      states.forEach(function(s){
        var opt = document.createElement('option'); opt.value = s.code; opt.textContent = s.name; stateSel.appendChild(opt);
      });
      stateSel.value = states.some(function(s){ return s.code === keep; }) ? keep : states[0].code;
      populateDependentFilters();
      updateMasthead();
      applyStateBackground();
      updateVersionUI();
      tickClock();
      render();
      syncControlsHeight();
    }).catch(function(err){
      if (token !== switchToken) return;
      updateVersionUI();
      loadError(err);
    });
  }
  renderVersionBar();
  updateVersionUI();

  render();
  } // initGrid
}

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
