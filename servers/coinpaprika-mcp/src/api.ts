const BASE = 'https://api.coinpaprika.com/v1';

export interface CoinArgs {
  id: string;
}

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function coin(args: CoinArgs): Promise<string> {
  const id = (args.id ?? '').trim().toLowerCase();
  if (!id) return 'Provide a coin id like btc-bitcoin.';
  const res = await fetch(`${BASE}/coins/${encodeURIComponent(id)}`, {
    headers: { 'User-Agent': 'mrfentmen-coinpaprika-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`CoinPaprika returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  return [
    `${s('name')} (${s('symbol')})`,
    s('description') ? `Desc: ${s('description').slice(0, 140)}` : '',
    s('rank') ? `Rank: ${s('rank')}` : '',
    s('type') ? `Type: ${s('type')}` : '',
    s('website_url') ? `Site: ${s('website_url')}` : '',
  ].filter(Boolean).join('\n') || `No data for ${id}.`;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const params = new URLSearchParams({ q, limit: String(limit) });
  const res = await fetch(`${BASE}/search?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-coinpaprika-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`CoinPaprika returned ${res.status}`);
  const d = (await res.json()) as { currencies?: Array<Record<string, unknown>> };
  const rows = (d.currencies ?? []).slice(0, limit);
  if (!rows.length) return `No coins found for "${q}".`;
  return `Coins for "${q}" (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('name')} (${s('symbol')})${s('rank') ? ` | rank ${s('rank')}` : ''}`;
      })
      .join('\n');
}
