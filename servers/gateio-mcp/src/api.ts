const BASE = 'https://api.gateio.ws/api/v4/spot';

export interface TickerArgs {
  symbol: string;
}

export async function ticker(args: TickerArgs): Promise<string> {
  const symbol = (args.symbol ?? '').trim().toUpperCase();
  if (!symbol) return 'Provide a trading pair like BTC_USDT.';
  const normalized = symbol.includes('_') ? symbol : symbol.replace(/(USDT|USDC|USD|BTC|ETH)$/, '_$1');
  const url = `${BASE}/tickers?currency_pair=${encodeURIComponent(normalized)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-gateio-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Gate.io returned ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, string>>;
  const row = rows.find((r) => r.currency_pair === normalized) ?? rows[0];
  if (!row?.last) return `No price found for ${normalized}.`;
  return `${row.currency_pair ?? normalized} on Gate.io:\n` +
    [
      `Price: ${row.last}`,
      `24h high: ${row.high_24h ?? 'n/a'}`,
      `24h low: ${row.low_24h ?? 'n/a'}`,
      `24h volume: ${Number(row.base_volume ?? 0).toLocaleString()}`,
    ].join('\n');
}
