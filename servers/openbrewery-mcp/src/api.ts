const BASE = 'https://api.openbrewerydb.org/v1/breweries';

export interface SearchArgs {
  query?: string;
  city?: string;
  limit?: number;
}

export async function search(args: SearchArgs = {}): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const params = new URLSearchParams({ per_page: String(limit) });
  if (args.query?.trim()) params.set('by_name', args.query.trim());
  if (args.city?.trim()) params.set('by_city', args.city.trim());
  const res = await fetch(`${BASE}?${params}`, {
    headers: { 'User-Agent': 'mrfentmen-openbrewery-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Open Brewery DB returned ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  if (!rows.length) return 'No breweries found for that search.';
  return `Breweries (${rows.length} shown):\n` +
    rows
      .map((b, i) => {
        const city = b.city ? ` | ${b.city}, ${b.state ?? ''}` : '';
        const type = b.brewery_type ? ` | ${b.brewery_type}` : '';
        return `${i + 1}. ${b.name ?? 'untitled'}${type}${city}`;
      })
      .join('\n');
}
