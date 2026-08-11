const UA = 'mrfentmen-crypto-com-mcp/1.0';

export interface TickerArgs {
  symbol: string;
}

export async function ticker(args: TickerArgs): Promise<string> {
  const symbol = (args.symbol ?? '').trim().toUpperCase();
  if (!symbol) return 'Provide a symbol like BTC_USDT.';
  const res = await fetch(`https://api.crypto.com/v2/public/get-ticker?instrument_name=${encodeURIComponent(symbol)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Crypto.com returned ${res.status}`);
  const d = (await res.json()) as { code?: number; result?: { data?: Array<{ i?: string; a?: string; b?: string; c?: string; h?: string; l?: string; v?: string }> } };
  const rows = d.result?.data ?? [];
  const t = rows.find((r) => r.i === symbol);
  if (!t) throw new Error(`Crypto.com: no ticker for ${symbol}`);
  return [
    `Crypto.com ${t.i ?? symbol}:`,
    `Last: ${t.a ?? '?'} | Bid: ${t.b ?? '?'} | Ask: ${t.c ?? '?'}`,
    `High: ${t.h ?? '?'} | Low: ${t.l ?? '?'} | Volume: ${t.v ?? '?'}`,
  ].filter(Boolean).join('\n');
}
