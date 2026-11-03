import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const day = new Date(Date.now() + 330 * 60000)
      .toISOString()
      .slice(0, 10);

    const cookie = req.headers.cookie || '';
    const match = cookie.match(/grid_visitor=([a-zA-Z0-9-]+)/);
    const visitor = match ? match[1] : crypto.randomUUID();

    if (!match) {
      res.setHeader(
        'Set-Cookie',
        `grid_visitor=${visitor}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
      );
    }

    const key = `motor-grid:visitor:${day}:${visitor}`;
    const first = await redis.set(key, '1', { nx: true, ex: 172800 });

    if (first === 'OK') {
      await redis.incr('motor-grid:total');
      await redis.incr(`motor-grid:today:${day}`);
    }

    const total = Number(await redis.get('motor-grid:total') || 0);
    const today = Number(await redis.get(`motor-grid:today:${day}`) || 0);

    return res.status(200).json({ visitors: total, today });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Visitor counter failed' });
  }
}
