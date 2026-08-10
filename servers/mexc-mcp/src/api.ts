const BASE = 'https://api.mexc.com/api/v3';

export interface TickerArgs {
  symbol: string;
}

export async function ticker(args: TickerArgs): Promise<string> {
  const symbol = (args.symbol ?? '').trim().toUpperCase();
  if (!symbol) return 'Provide a trading pair like BTCUSDT.';
  const res = await fetch(`${BASE}/ticker/price?symbol=${encodeURIComponent(symbol)}`, {
    headers: { 'User-Agent': 'mrfentmen-mexc-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`MEXC returned ${res.status}`);
  const data = (await res.json()) as { symbol?: string; price?: string };
  if (!data.price) return `No price found for ${symbol}.`;
  return `${data.symbol ?? symbol} price on MEXC: ${data.price}`;
}
