/*
 * Motor Smart GRID – visitor counter for Vercel (replaces visitor-counter.php, which Vercel can't run).
 *
 * Same behaviour as the PHP counter:
 *   A visit = one browser on one day (India time). Opening the GRID again the same day doesn't add;
 *   coming back on a later day counts again. A cookie (sg_day) remembers the day the browser was
 *   last counted; it expires at midnight India time.
 *   Returns {"visitors": <total visits>, "today": <visits today>}. Nothing else is stored.
 *
 * Storage: a Redis database from the Vercel Marketplace ("Upstash for Redis", free plan).
 * Connecting it to the project sets KV_REST_API_URL and KV_REST_API_TOKEN automatically
 * (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN also work). No npm packages needed.
 *
 * Keys:  <prefix>:total          total visits
 *        <prefix>:day:YYYY-MM-DD  visits that day (kept 400 days)
 * Optional environment variables:
 *   SG_COUNTER_PREFIX    key prefix (default "motor-smart-grid") - change it to keep two sites apart
 *   SG_START_TOTAL       number added to the total (e.g. visits counted earlier on another server)
 *
 * Health check for the deployment team: open /api/visitor-counter?check=1 in a browser.
 */
const DAY_TTL = 400 * 24 * 3600;

function store() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  return url && token ? { url: url.replace(/\/+$/, ''), token } : null;
}

async function redis(db, commands) {
  const r = await fetch(db.url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + db.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error('Redis answered HTTP ' + r.status);
  const out = await r.json();
  return out.map((x) => {
    if (x && x.error) throw new Error(x.error);
    return x ? x.result : null;
  });
}

function istNow() {
  return new Date(Date.now() + 330 * 60000);          // India time, read with getUTC*
}

function readCookie(req, name) {
  const all = String(req.headers.cookie || '');
  const m = all.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.end(JSON.stringify(body, null, body && body.counter ? 2 : 0));
}

module.exports = async function handler(req, res) {
  const db = store();
  const prefix = process.env.SG_COUNTER_PREFIX || 'motor-smart-grid';
  const start = parseInt(process.env.SG_START_TOTAL || '0', 10) || 0;
  const now = istNow();
  const today = now.toISOString().slice(0, 10);
  const totalKey = prefix + ':total';
  const dayKey = prefix + ':day:' + today;
  const query = new URL(req.url, 'http://x').searchParams;

  if (query.has('check')) {
    let ok = false, err = null;
    if (db) {
      try { ok = (await redis(db, [['PING']]))[0] === 'PONG'; } catch (e) { err = String(e.message || e); }
    }
    return send(res, 200, {
      counter: 'Motor Smart GRID visitor counter (Vercel)',
      redis_connected: !!db,
      redis_reachable: ok,
      error: err,
      result: !db ? 'FIX - connect an Upstash for Redis database to this Vercel project (Storage tab), then redeploy'
            : ok ? 'OK - the counter can work'
            : 'FIX - the Redis database did not answer: check KV_REST_API_URL / KV_REST_API_TOKEN',
    });
  }

  if (!db) return send(res, 503, { visitors: null, today: null });

  try {
    const counted = readCookie(req, 'sg_day') === today;
    let total, todayN;
    if (req.method === 'POST' && !counted) {
      [total, todayN] = await redis(db, [['INCR', totalKey], ['INCR', dayKey], ['EXPIRE', dayKey, DAY_TTL]]);
      const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) - 330 * 60000);
      res.setHeader('Set-Cookie', 'sg_day=' + today + '; Path=/; Expires=' + midnight.toUTCString()
        + '; SameSite=Lax; HttpOnly; Secure');
    } else {
      [total, todayN] = await redis(db, [['GET', totalKey], ['GET', dayKey]]);
    }
    return send(res, 200, { visitors: (Number(total) || 0) + start, today: Number(todayN) || 0 });
  } catch (e) {
    console.error('[Smart GRID] visitor counter:', e);
    return send(res, 502, { visitors: null, today: null });
  }
};
