const BASE = 'https://api.bitget.com/api/v2/spot/market/tickers';
const UA = 'mrfentmen-bitget-mcp/1.0';

export interface TickerArgs {
  symbol: string;
}

export async function ticker(args: TickerArgs): Promise<string> {
  const symbol = (args.symbol ?? '').trim().toUpperCase();
  if (!symbol) return 'Provide a symbol like BTCUSDT.';
  const res = await fetch(`${BASE}?symbol=${encodeURIComponent(symbol)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Bitget returned ${res.status}`);
  const d = (await res.json()) as { data?: Array<{ symbol?: string; lastPr?: string; askPr?: string; bidPr?: string; high24h?: string; low24h?: string; baseVolume?: string }> };
  const rows = d.data ?? [];
  if (!rows.length) return `No ticker for ${symbol}.`;
  const t = rows[0];
  return [
    `Bitget ${t.symbol ?? symbol}:`,
    `Last: ${t.lastPr ?? '?'} | Bid: ${t.bidPr ?? '?'} | Ask: ${t.askPr ?? '?'}`,
    `24h: high ${t.high24h ?? '?'} low ${t.low24h ?? '?'}`,
    `Volume: ${t.baseVolume ?? '?'}`,
  ].filter(Boolean).join('\n');
}
