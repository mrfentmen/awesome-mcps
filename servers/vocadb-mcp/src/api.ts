const BASE = 'https://vocadb.net/api/songs';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const params = new URLSearchParams({ query: q, maxResults: String(limit), fields: 'Names,MainPicture' });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-vocadb-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`VocaDB returned ${res.status}`);
  const d = (await res.json()) as { items?: Array<Record<string, unknown>> };
  const rows = d.items ?? [];
  if (!rows.length) return `No VocaDB songs found for "${q}".`;
  return `VocaDB songs for "${q}" (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        const name = s('name');
        return `${i + 1}. ${name}${s('artistString') ? ` | ${s('artistString')}` : ''}${s('songType') ? ` [${s('songType')}]` : ''}`;
      })
      .join('\n');
}
