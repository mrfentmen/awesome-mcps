const UA = 'mrfentmen-bitstamp-mcp/1.0';

export interface TickerArgs {
  pair: string;
}

export async function ticker(args: TickerArgs): Promise<string> {
  const pair = (args.pair ?? '').trim().toLowerCase();
  if (!pair) return 'Provide a pair like btcusd.';
  const res = await fetch(`https://www.bitstamp.net/api/v2/ticker/${encodeURIComponent(pair)}/`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Bitstamp returned ${res.status}`);
  const d = (await res.json()) as Record<string, string>;
  if (d.status === 'error') throw new Error(`Bitstamp: ${String(d.reason ?? 'error')}`);
  const get = (k: string) => d[k] ?? '?';
  return [
    `Bitstamp ${pair}:`,
    `Last: ${get('last')} | Bid: ${get('bid')} | Ask: ${get('ask')}`,
    `High: ${get('high')} | Low: ${get('low')} | Volume: ${get('volume')}`,
    `Timestamp: ${get('timestamp') ? new Date(Number(get('timestamp')) * 1000).toISOString() : '?'}`,
  ].filter(Boolean).join('\n');
}
