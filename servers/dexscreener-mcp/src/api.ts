const BASE = 'https://api.dexscreener.com/latest/dex';
const UA = 'mrfentmen-dexscreener-mcp/1.0';

export interface SearchArgs {
  query: string;
}

export interface TokensArgs {
  address: string;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide a token symbol or name.';
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`DexScreener returned ${res.status}`);
  const d = (await res.json()) as { pairs?: Array<{ pairAddress?: string; baseToken?: { symbol?: string; name?: string }; quoteToken?: { symbol?: string }; priceUsd?: string; chainId?: string; dexId?: string; volume?: { h24?: number }; priceChange?: { h24?: number } }> };
  const pairs = d.pairs ?? [];
  if (!pairs.length) return `No pairs for "${query}".`;
  return `DexScreener results for "${query}" (${pairs.length}):\n` +
    pairs.slice(0, 10).map((p, i) => {
      const bt = p.baseToken ?? {};
      const qt = p.quoteToken ?? {};
      const chg = p.priceChange?.h24 != null ? `${p.priceChange.h24 >= 0 ? '+' : ''}${p.priceChange.h24.toFixed(2)}%` : '?';
      return `${i + 1}. ${bt.symbol ?? '?'}/${qt.symbol ?? '?'} on ${p.dexId ?? '?'} (${p.chainId ?? '?'}) $${p.priceUsd ?? '?'} ${chg} 24h vol $${p.volume?.h24 != null ? p.volume.h24.toFixed(0) : '?'}`;
    }).join('\n');
}

export async function tokens(args: TokensArgs): Promise<string> {
  const address = (args.address ?? '').trim();
  if (!address) return 'Provide a token address.';
  const res = await fetch(`${BASE}/tokens/${encodeURIComponent(address)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`DexScreener returned ${res.status}`);
  const d = (await res.json()) as { pairs?: Array<{ pairAddress?: string; baseToken?: { symbol?: string; name?: string }; priceUsd?: string; chainId?: string; dexId?: string; volume?: { h24?: number }; priceChange?: { h24?: number } }> };
  const pairs = d.pairs ?? [];
  if (!pairs.length) return `No pairs for ${address.slice(0, 12)}...`;
  const best = pairs.slice().sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0));
  const rows = best.slice(0, 8).map((p, i) => {
    const bt = p.baseToken ?? {};
    const chg = p.priceChange?.h24 != null ? `${p.priceChange.h24 >= 0 ? '+' : ''}${p.priceChange.h24.toFixed(2)}%` : '?';
    return `${i + 1}. ${bt.symbol ?? '?'} $${p.priceUsd ?? '?'} ${chg} on ${p.dexId ?? '?'} (${p.chainId ?? '?'}) vol $${p.volume?.h24 != null ? p.volume.h24.toFixed(0) : '?'}`;
  });
  return `Top DexScreener pairs for ${address.slice(0, 12)}...:\n${rows.join('\n')}`;
}
