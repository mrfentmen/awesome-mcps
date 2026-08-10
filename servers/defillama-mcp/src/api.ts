const BASE = 'https://api.llama.fi';

export async function chains(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/v2/chains`, {
    headers: { 'User-Agent': 'mrfentmen-defillama-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`DefiLlama returned ${res.status}`);
  const d = (await res.json()) as Array<Record<string, unknown>>;
  if (!d.length) return 'No chain data returned.';
  const fmt = (v: unknown) => {
    const n = Number(v);
    if (!n) return '$0';
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    return `$${n.toFixed(0)}`;
  };
  return `DeFi TVL by chain (${d.length} chains):\n` +
    d.slice(0, 20).map((c, i) => {
      const s = (k: string) => (c[k] != null ? String(c[k]) : '');
      return `${i + 1}. ${s('name')} | ${fmt(c.tvl)}`;
    }).join('\n');
}

export async function protocol(args: { slug: string }): Promise<string> {
  const slug = (args.slug ?? '').trim();
  if (!slug) return 'Provide a protocol slug.';
  const res = await fetch(`${BASE}/protocol/${encodeURIComponent(slug)}`, {
    headers: { 'User-Agent': 'mrfentmen-defillama-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`DefiLlama returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  const tvl = d.tvl ?? [];
  const latest = Array.isArray(tvl) && tvl.length ? (tvl as Array<Record<string, unknown>>).at(-1) : null;
  const chainTvls = (d.currentChainTvls ?? {}) as Record<string, unknown>;
  return [
    `Protocol: ${s('name')}`,
    s('url') ? `Site: ${s('url')}` : '',
    latest ? `Latest TVL: $${Number(latest.tvl ?? 0).toLocaleString()}` : '',
    Object.keys(chainTvls).length ? `Chains: ${Object.entries(chainTvls).slice(0, 8).map(([k, v]) => `${k} $${Math.round(Number(v)).toLocaleString()}`).join(', ')}` : '',
  ].filter(Boolean).join('\n');
}
