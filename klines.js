import { BASE, CATEGORY, getJSON } from './_utils.js';

export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { searchParams } = new URL(req.url, 'http://x');
    const symbol = (searchParams.get('symbol') || 'BTCUSDT').toUpperCase();
    const interval = String(searchParams.get('interval') || '240');
    const limit = String(Math.min(Math.max(Number(searchParams.get('limit') || 300), 1), 1000));
    const r = await getJSON(`${BASE}/v5/market/kline?category=${CATEGORY}&symbol=${symbol}&interval=${interval}&limit=${limit}`);
    const rows = (r.list || []).slice().sort((a,b)=>+a[0]-+b[0]);
    const kl = rows.map(k => [+k[0], +k[1], +k[2], +k[3], +k[4], +k[5]]);
    res.status(200).json({ symbol, interval: +interval, klines: kl });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
