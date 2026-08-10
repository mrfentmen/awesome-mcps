const BASE = 'https://api.coingecko.com/api/v3';

export interface PriceArgs {
  coin: string;
  currency?: string;
}

export async function price(args: PriceArgs): Promise<string> {
  const coin = (args.coin ?? '').trim().toLowerCase();
  if (!coin) return 'Provide a coin id like bitcoin or ethereum.';
  const currency = (args.currency ?? 'usd').toLowerCase();
  const url = `${BASE}/simple/price?ids=${encodeURIComponent(coin)}&vs_currencies=${encodeURIComponent(currency)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-coingecko-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`CoinGecko returned ${res.status}`);
  const data = (await res.json()) as Record<string, Record<string, number>>;
  const entry = data[coin];
  if (!entry) return `No price found for coin "${coin}".`;
  const value = entry[currency];
  if (typeof value !== 'number') return `No ${currency} price found for "${coin}".`;
  return `${coin} price: ${value.toLocaleString()} ${currency.toUpperCase()}`;
}

export async function trending(_args: Record<string, never> = {}): Promise<string> {
  const res = await fetch(`${BASE}/search/trending`, {
    headers: { 'User-Agent': 'mrfentmen-coingecko-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`CoinGecko returned ${res.status}`);
  const data = (await res.json()) as {
    coins?: Array<{
      item?: { id?: string; name?: string; symbol?: string; market_cap_rank?: number; price_btc?: number };
    }>;
  };
  const coins = (data.coins ?? []).slice(0, 10);
  if (!coins.length) throw new Error('CoinGecko returned no trending coins');
  return `Trending coins on CoinGecko:\n` +
    coins
      .map((c, i) => `${i + 1}. ${c.item?.name ?? ''} (${c.item?.symbol ?? ''}) rank ${c.item?.market_cap_rank ?? 'n/a'} | ${c.item?.id ?? ''}`)
      .join('\n');
}
