const BASE = 'https://api.core.ac.uk/v3/search/works';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const body = JSON.stringify({ q: query, limit });
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'User-Agent': 'mrfentmen-core-mcp/1.0', Accept: 'application/json', 'Content-Type': 'application/json' },
    body,
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`CORE returned ${res.status}`);
  const d = (await res.json()) as { results?: Array<Record<string, unknown>> };
  const rows = d.results ?? [];
  if (!rows.length) return `No works found for "${query}".`;
  return `CORE works for "${query}" (${rows.length} shown):\n` +
    rows.map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      const authors = (r.authors ?? []) as Array<Record<string, unknown>>;
      const auth = authors.slice(0, 2).map((a) => String(a.name ?? '')).join(', ');
      return `${i + 1}. ${s('title')}${auth ? ` | ${auth}` : ''} | ${s('yearPublished')}`;
    }).join('\n');
}
