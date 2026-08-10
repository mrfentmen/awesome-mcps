const BASE = 'https://open.er-api.com/v6';

export interface LatestArgs {
  base?: string;
}

export interface HistoryArgs {
  base?: string;
  symbols?: string;
}

interface ErResponse {
  result?: string;
  base_code?: string;
  rates?: Record<string, number>;
  time_last_update_utc?: string;
}

export async function latest(args: LatestArgs = {}): Promise<string> {
  const base = (args.base ?? 'USD').toUpperCase();
  const res = await fetch(`${BASE}/latest/${base}`, {
    headers: { 'User-Agent': 'mrfentmen-currency-history-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`ExchangeRate API returned ${res.status}`);
  const data = (await res.json()) as ErResponse;
  if (data.result !== 'success' || !data.rates) throw new Error('ExchangeRate API returned no rates');
  const entries = Object.entries(data.rates).slice(0, 30);
  return `Exchange rates vs ${data.base_code} (${data.time_last_update_utc ?? ''}):\n` + entries.map(([code, rate], i) => `${i + 1}. ${code}: ${rate}`).join('\n');
}

export async function history(args: HistoryArgs = {}): Promise<string> {
  const base = (args.base ?? 'USD').toUpperCase();
  const res = await fetch(`${BASE}/latest/${base}`, {
    headers: { 'User-Agent': 'mrfentmen-currency-history-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`ExchangeRate API returned ${res.status}`);
  const data = (await res.json()) as ErResponse;
  if (data.result !== 'success' || !data.rates) throw new Error('ExchangeRate API returned no rates');
  const wanted = (args.symbols ?? '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const entries = wanted.length
    ? wanted.map((code) => [code, data.rates?.[code]] as const).filter(([, v]) => typeof v === 'number')
    : Object.entries(data.rates).slice(0, 15);
  if (!entries.length) return `No rates found for ${wanted.join(', ')}.`;
  return `Exchange rates vs ${data.base_code} (${data.time_last_update_utc ?? ''}):\n` + entries.map(([code, rate], i) => `${i + 1}. ${code}: ${rate}`).join('\n');
}
