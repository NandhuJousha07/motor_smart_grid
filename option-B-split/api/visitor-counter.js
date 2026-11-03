export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ error: "Redis environment variables missing" });
  }

  const redis = async (command) => {
    const response = await fetch(url + "/" + command, {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || "Redis error");
    return data.result;
  };

  try {
    const day = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
    const cookie = req.headers.cookie || "";
    const match = cookie.match(/grid_visitor=([a-zA-Z0-9-]+)/);
    const visitor = match ? match[1] : crypto.randomUUID();

    if (!match) {
      res.setHeader("Set-Cookie",
        "grid_visitor=" + visitor + "; Path=/; Max-Age=31536000; SameSite=Lax; Secure");
    }

    const uniqueKey = "motor-grid:visitor:" + day + ":" + visitor;
    const firstToday = await redis("set/" + encodeURIComponent(uniqueKey) + "/1/NX/EX/172800");

    if (firstToday === "OK") {
      await redis("incr/motor-grid:total");
      await redis("incr/motor-grid:today:" + day);
    }

    const total = await redis("get/motor-grid:total");
    const today = await redis("get/motor-grid:today:" + day);

    return res.status(200).json({
      visitors: Number(total || 0),
      today: Number(today || 0)
    });
  } catch (error) {
    console.error("Visitor counter:", error);
    return res.status(500).json({ error: "Visitor counter failed" });
  }
}
