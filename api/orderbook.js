import { BASE, CATEGORY, getJSON } from './_utils.js';

export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const u = new URL(req.url, 'http://x');
    const symbol = (u.searchParams.get('symbol') || 'BTCUSDT').toUpperCase();
    const limit = Math.min(Math.max(Number(u.searchParams.get('limit') || 50), 1), 200);
    const r = await getJSON(`${BASE}/v5/market/orderbook?category=${CATEGORY}&symbol=${symbol}&limit=${limit}`);
    res.status(200).json({
      symbol,
      bids: (r.b || []).map(([p, s]) => [+p, +s]),
      asks: (r.a || []).map(([p, s]) => [+p, +s])
    });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
