const UA = 'mrfentmen-phemex-mcp/1.0';

export interface TickerArgs {
  symbol: string;
}

export async function ticker(args: TickerArgs): Promise<string> {
  const symbol = (args.symbol ?? '').trim().toUpperCase();
  if (!symbol) return 'Provide a symbol like BTCUSD.';
  const res = await fetch(`https://api.phemex.com/v1/md/ticker/24hr?symbol=${encodeURIComponent(symbol)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Phemex returned ${res.status}`);
  const d = (await res.json()) as { error?: unknown; result?: { symbol?: string; lastEp?: number; askEp?: number; bidEp?: number; highEp?: number; lowEp?: number; openEp?: number; turnoverEp?: number } };
  const r = d.result;
  if (!r) throw new Error('Phemex: no result');
  const ep = (v: number | undefined) => (v != null ? v / 1e4 : null);
  const last = ep(r.lastEp);
  const chg = r.openEp ? ((ep(r.lastEp) ?? 0) - ep(r.openEp)!) / ep(r.openEp)! * 100 : null;
  return [
    `Phemex ${r.symbol ?? symbol}:`,
    `Last: ${last != null ? '$' + last.toFixed(2) : '?'} | Ask: ${ep(r.askEp) ?? '?'} | Bid: ${ep(r.bidEp) ?? '?'}`,
    `High: ${ep(r.highEp) ?? '?'} | Low: ${ep(r.lowEp) ?? '?'} | 24h change: ${chg != null ? chg.toFixed(2) + '%' : '?'}`,
  ].filter(Boolean).join('\n');
}
