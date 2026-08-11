const UA = 'mrfentmen-whitebit-mcp/1.0';

export interface TickerArgs {
  market: string;
}

export async function ticker(args: TickerArgs): Promise<string> {
  const market = (args.market ?? '').trim().toUpperCase();
  if (!market) return 'Provide a market like BTC_USDT.';
  const res = await fetch('https://whitebit.com/api/v4/public/ticker', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`WhiteBIT returned ${res.status}`);
  const d = (await res.json()) as Record<string, { last_price?: string; bid?: string; ask?: string; high?: string; low?: string; volume?: string; change?: string; quote_volume?: string; isFrozen?: boolean }>;
  const t = d[market];
  if (!t) throw new Error(`WhiteBIT: no ticker for ${market}`);
  return [
    `WhiteBIT ${market}:`,
    `Last: ${t.last_price ?? '?'} | Bid: ${t.bid ?? '?'} | Ask: ${t.ask ?? '?'}`,
    `High: ${t.high ?? '?'} | Low: ${t.low ?? '?'} | 24h change: ${t.change ?? '?'}% | Volume: ${t.volume ?? t.quote_volume ?? '?'}${t.isFrozen ? ' (frozen)' : ''}`,
  ].filter(Boolean).join('\n');
}
