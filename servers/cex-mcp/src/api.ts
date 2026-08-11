const UA = 'mrfentmen-cex-mcp/1.0';

export interface TickerArgs {
  pair: string;
}

export async function ticker(args: TickerArgs): Promise<string> {
  const pair = (args.pair ?? '').trim().toUpperCase();
  if (!pair) return 'Provide a pair like BTC/USD.';
  const [c1, c2] = pair.split('/');
  if (!c1 || !c2) return 'Pair format: BTC/USD.';
  const res = await fetch(`https://cex.io/api/ticker/${encodeURIComponent(c1)}/${encodeURIComponent(c2)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`CEX.IO returned ${res.status}`);
  const d = (await res.json()) as Record<string, string>;
  if (d.error) throw new Error(`CEX.IO: ${String(d.error)}`);
  const get = (k: string) => d[k] ?? '?';
  return [
    `CEX.IO ${c1}/${c2}:`,
    `Last: ${get('last')} | Bid: ${get('bid')} | Ask: ${get('ask')}`,
    `High: ${get('high')} | Low: ${get('low')} | Volume: ${get('volume')} ${c1}`,
  ].filter(Boolean).join('\n');
}
