const BASE = 'https://api-pub.bitfinex.com/v2';

export interface TickerArgs {
  symbol: string;
}

export interface PriceArgs {
  symbol: string;
}

export async function ticker(args: TickerArgs): Promise<string> {
  let symbol = (args.symbol ?? '').trim();
  if (!symbol) return 'Provide a symbol like tBTCUSD.';
  if (!symbol.startsWith('t')) symbol = 't' + symbol;
  const res = await fetch(`${BASE}/ticker/${encodeURIComponent(symbol)}`, {
    headers: { 'User-Agent': 'mrfentmen-bitfinex-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Bitfinex returned ${res.status}`);
  const d = (await res.json()) as number[];
  if (!Array.isArray(d) || d.length < 10) return `No ticker for ${symbol}.`;
  const last = d[6];
  const high = d[8];
  const low = d[9];
  const vol = d[7];
  return [
    `Bitfinex ${symbol}:`,
    `Last: ${String(last ?? '?')}`,
    `24h: high ${String(high ?? '?')} low ${String(low ?? '?')}`,
    `Volume: ${String(vol ?? '?')}`,
  ].filter(Boolean).join('\n');
}

export async function price(args: PriceArgs): Promise<string> {
  let symbol = (args.symbol ?? '').trim();
  if (!symbol) return 'Provide a symbol like tBTCUSD.';
  if (!symbol.startsWith('t')) symbol = 't' + symbol;
  const res = await fetch(`${BASE}/ticker/${encodeURIComponent(symbol)}`, {
    headers: { 'User-Agent': 'mrfentmen-bitfinex-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Bitfinex returned ${res.status}`);
  const d = (await res.json()) as number[];
  if (!Array.isArray(d) || d.length < 7) return `No price for ${symbol}.`;
  return `Bitfinex ${symbol}: ${d[6]}`;
}
