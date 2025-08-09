import { BASE, CATEGORY, getJSON, ema, rsi, macdCalc } from './_utils.js';

export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { searchParams } = new URL(req.url, 'http://x');
    const symbol = (searchParams.get('symbol') || 'BTCUSDT').toUpperCase();
    const interval = String(searchParams.get('interval') || '240');
    const limit = String(Math.min(Math.max(Number(searchParams.get('limit') || 300), 1), 1000));
    const r = await getJSON(`${BASE}/v5/market/kline?category=${CATEGORY}&symbol=${symbol}&interval=${interval}&limit=${limit}`);
    const rows = (r.list || []).slice().sort((a,b)=>+a[0]-+b[0]);
    const closes = rows.map(k => +k[4]);
    const ema20 = ema(closes, 20);
    const ema50 = ema(closes, 50);
    const ema200 = ema(closes, 200);
    const rsi14 = rsi(closes, 14);
    const { macd, signal, hist } = macdCalc(closes, 12, 26, 9);
    const i = closes.length - 1;
    res.status(200).json({
      symbol,
      interval: +interval,
      latest: {
        close: closes[i],
        ema20: ema20[i] ?? null,
        ema50: ema50[i] ?? null,
        ema200: ema200[i] ?? null,
        rsi14: rsi14[i] ?? null,
        macd: macd[i] ?? null,
        macdSignal: signal[i] ?? null,
        macdHist: hist[i] ?? null
      }
    });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
