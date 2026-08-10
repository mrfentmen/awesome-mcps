const BASE = 'https://www.wikidata.org/w/api.php';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const params = new URLSearchParams({
    action: 'wbsearchentities',
    search: q,
    language: 'en',
    format: 'json',
    limit: String(limit),
  });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-wikidata-search-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Wikidata returned ${res.status}`);
  const data = (await res.json()) as { search?: Array<{ id?: string; label?: string; description?: string; url?: string }> };
  const rows = data.search ?? [];
  if (!rows.length) return `No Wikidata entities found for "${q}".`;
  return `Wikidata entities for "${q}" (${rows.length} shown):\n` +
    rows
      .map((r, i) => `${i + 1}. ${r.label ?? ''} (${r.id ?? ''})${r.description ? ` | ${r.description}` : ''}${r.url ? `\n   ${r.url}` : ''}`)
      .join('\n');
}
