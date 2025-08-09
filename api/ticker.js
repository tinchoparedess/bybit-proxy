import { BASE, CATEGORY, getJSON } from './_utils.js';

export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { searchParams } = new URL(req.url, 'http://x');
    const symbol = (searchParams.get('symbol') || 'BTCUSDT').toUpperCase();
    const r = await getJSON(`${BASE}/v5/market/tickers?category=${CATEGORY}&symbol=${symbol}`);
    const t = r.list?.[0];
    if (!t) throw new Error('empty ticker');
    res.status(200).json({
      symbol,
      last: +t.lastPrice,
      index: +t.indexPrice,
      mark: +t.markPrice,
      vol24h: +t.volume24h,
      change24hPct: +t.price24hPcnt * 100
    });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
