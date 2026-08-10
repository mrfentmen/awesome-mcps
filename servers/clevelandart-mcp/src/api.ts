const BASE = 'https://openaccess-api.clevelandart.org/api/artworks';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export interface ArtworkArgs {
  id: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/?q=${encodeURIComponent(query)}&limit=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-clevelandart-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Cleveland Museum returned ${res.status}`);
  const d = (await res.json()) as { data?: Array<Record<string, unknown>> };
  const rows = d.data ?? [];
  if (!rows.length) return `No artworks found for "${query}".`;
  return `Cleveland artworks for "${query}" (${rows.length} shown):\n` +
    rows.map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      return `${i + 1}. ${s('title')}${s('creators') ? ` | ${s('creators')}` : ''} (${s('id')})`;
    }).join('\n');
}

export async function artwork(args: ArtworkArgs): Promise<string> {
  const id = Math.floor(args.id ?? 0);
  if (!id) return 'Provide an artwork id.';
  const res = await fetch(`${BASE}/${id}`, {
    headers: { 'User-Agent': 'mrfentmen-clevelandart-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Cleveland Museum returned ${res.status}`);
  const d = (await res.json()) as { data?: Record<string, unknown> };
  const r = d.data;
  if (!r) return `No artwork with id ${id}.`;
  const s = (k: string) => (r[k] != null ? String(r[k]) : '');
  return [
    s('title'),
    s('creators') ? `Artist: ${s('creators')}` : '',
    s('creation_date') ? `Date: ${s('creation_date')}` : '',
    s('technique') ? `Technique: ${s('technique')}` : '',
    s('description') ? `\n${s('description')}` : '',
  ].filter(Boolean).join('\n');
}
