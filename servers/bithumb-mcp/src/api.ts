const UA = 'mrfentmen-bithumb-mcp/1.0';

export interface TickerArgs {
  coin: string;
}

export async function ticker(args: TickerArgs): Promise<string> {
  const coin = (args.coin ?? '').trim().toUpperCase();
  if (!coin) return 'Provide a coin like BTC.';
  const res = await fetch(`https://api.bithumb.com/public/ticker/${encodeURIComponent(coin)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Bithumb returned ${res.status}`);
  const d = (await res.json()) as { status?: string; data?: Record<string, string> };
  if (d.status !== '0000' || !d.data) throw new Error(`Bithumb: ${d.status ?? 'error'}`);
  const get = (k: string) => d.data?.[k] ?? '?';
  return [
    `Bithumb ${coin}:`,
    `Closing: ${get('closing_price')} KRW | Opening: ${get('opening_price')} | High: ${get('max_price')} | Low: ${get('min_price')}`,
    `24h volume: ${get('units_traded_24H')} ${coin} | Change: ${get('fluctate_rate')}%`,
  ].filter(Boolean).join('\n');
}
