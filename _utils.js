// Shared helpers for Bybit public API + indicators
export const BASE = 'https://api.bybit.com'; // fallback: 'https://api.bytick.com'
export const CATEGORY = 'linear'; // USDT perp

export async function getJSON(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'bybit-proxy' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${await r.text()}`);
  const j = await r.json();
  if (j.retCode !== 0) throw new Error(`Bybit retCode ${j.retCode}: ${j.retMsg}`);
  return j.result;
}

export function ema(arr, p) {
  if (!arr.length) return [];
  const k = 2 / (p + 1);
  const out = new Array(arr.length);
  let prev = arr[0];
  out[0] = prev;
  for (let i = 1; i < arr.length; i++) {
    prev = arr[i] * k + arr[i] * 0 + prev * (1 - k);
    prev = arr[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

export function rsi(arr, period = 14) {
  if (arr.length < period + 1) return new Array(arr.length).fill(null);
  const out = new Array(arr.length).fill(null);
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const ch = arr[i] - arr[i - 1];
    if (ch > 0) gains += ch; else losses -= ch;
  }
  gains /= period; losses /= period;
  out[period] = 100 - 100 / (1 + gains / (losses || 1e-9));
  for (let i = period + 1; i < arr.length; i++) {
    const ch = arr[i] - arr[i - 1];
    gains = (gains * (period - 1) + Math.max(ch, 0)) / period;
    losses = (losses * (period - 1) + Math.max(-ch, 0)) / period;
    out[i] = 100 - 100 / (1 + gains / (losses || 1e-9));
  }
  return out;
}

export function macdCalc(arr, fast = 12, slow = 26, signalP = 9) {
  if (!arr.length) return { macd: [], signal: [], hist: [] };
  const emaFast = ema(arr, fast);
  const emaSlow = ema(arr, slow);
  const macd = arr.map((_, i) => (emaFast[i] ?? 0) - (emaSlow[i] ?? 0));
  const signal = ema(macd, signalP);
  const hist = macd.map((v, i) => v - (signal[i] ?? 0));
  return { macd, signal, hist };
}
