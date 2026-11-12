/* EG Smart GRID – visitor counter (Vercel Serverless Function)
 *
 * Page calls:  POST /api/visitor-counter   ->  {"visitors": <total>, "today": <today>}
 * Health check: GET /api/visitor-counter?check=1  (shows whether the store is connected; never shows secrets)
 *
 * A visit = one browser on one day (India time). The browser gets an anonymous random id in a
 * first-party cookie (sg_vid); opening the GRID again the same day does not add, the next day does.
 * Nothing else about the visitor is stored.
 *
 * Storage: Redis over REST (Upstash for Redis, added from the Vercel Marketplace / Storage tab).
 * Vercel injects these environment variables when the database is connected to the project:
 *   KV_REST_API_URL + KV_REST_API_TOKEN      (or)   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * No npm packages are needed (uses the built-in fetch of Node 18+).
 */
const crypto = require('crypto');

const PREFIX = process.env.GRID_COUNTER_PREFIX || 'egsg';           // key prefix, change per site if a DB is shared
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

function istDay() { return new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10); }

async function redis(commands) {
  const r = await fetch(URL_.replace(/\/+$/, '') + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error('store answered HTTP ' + r.status);
  const out = await r.json();
  const bad = out.find(x => x && x.error);
  if (bad) throw new Error('store error: ' + bad.error);
  return out.map(x => x.result);
}

function readCookie(req, name) {
  const m = (req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + name + '=([A-Za-z0-9-]{8,64})'));
  return m ? m[1] : null;
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  const configured = Boolean(URL_ && TOKEN);
  const isCheck = /[?&]check=1\b/.test(req.url || '');

  if (req.method === 'GET' && isCheck) {
    if (!configured) return send(res, 200, { ok: false, store: 'not connected',
      fix: 'Connect a Redis (Upstash) database to this Vercel project, then redeploy.' });
    try {
      const [total, today] = await redis([['GET', PREFIX + ':total'], ['GET', PREFIX + ':day:' + istDay()]]);
      return send(res, 200, { ok: true, store: 'connected', visitors: Number(total) || 0, today: Number(today) || 0 });
    } catch (e) { return send(res, 200, { ok: false, store: 'connected but failing', error: String(e.message) }); }
  }
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { error: 'POST only' }); }
  if (!configured) return send(res, 503, { error: 'counter store not connected' });

  try {
    let vid = readCookie(req, 'sg_vid');
    if (!vid) {
      vid = crypto.randomUUID();
      res.setHeader('Set-Cookie', `sg_vid=${vid}; Path=/; Max-Age=34560000; SameSite=Lax; Secure; HttpOnly`);
    }
    const day = istDay();
    const seenKey = `${PREFIX}:seen:${day}`, dayKey = `${PREFIX}:day:${day}`, totalKey = `${PREFIX}:total`;
    const [added] = await redis([['SADD', seenKey, vid], ['EXPIRE', seenKey, 172800]]);
    let total, today;
    if (Number(added) === 1) {
      [total, today] = await redis([['INCR', totalKey], ['INCR', dayKey], ['EXPIRE', dayKey, 3456000]]);
    } else {
      [total, today] = await redis([['GET', totalKey], ['GET', dayKey]]);
    }
    return send(res, 200, { visitors: Number(total) || 0, today: Number(today) || 0 });
  } catch (e) {
    return send(res, 502, { error: String(e.message) });
  }
};
