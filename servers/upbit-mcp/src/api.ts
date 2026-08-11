const UA = 'mrfentmen-upbit-mcp/1.0';

export interface TickerArgs {
  market: string;
}

export async function ticker(args: TickerArgs): Promise<string> {
  const market = (args.market ?? '').trim().toUpperCase();
  if (!market) return 'Provide a market like KRW-BTC.';
  const url = `https://api.upbit.com/v1/ticker?markets=${encodeURIComponent(market)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Upbit returned ${res.status}`);
  const d = (await res.json()) as Array<{ market?: string; trade_price?: number; opening_price?: number; high_price?: number; low_price?: number; acc_trade_price_24h?: number; signed_change_rate?: number }>;
  const t = d?.[0];
  if (!t) return `No ticker for ${market}.`;
  return [
    `Upbit ${t.market ?? market}:`,
    `Price: ${t.trade_price} KRW | Open: ${t.opening_price} | High: ${t.high_price} | Low: ${t.low_price}`,
    `24h change: ${t.signed_change_rate != null ? (t.signed_change_rate * 100).toFixed(2) : '?'}% | 24h volume: ${t.acc_trade_price_24h != null ? (t.acc_trade_price_24h / 1e6).toFixed(1) : '?'}M KRW`,
  ].filter(Boolean).join('\n');
}
