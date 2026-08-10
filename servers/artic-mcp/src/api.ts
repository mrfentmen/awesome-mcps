const BASE = 'https://api.artic.edu/api/v1/artworks';

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
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}&fields=id,title,artist_title,date_display,image_id`, {
    headers: { 'User-Agent': 'mrfentmen-artic-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Artic returned ${res.status}`);
  const d = (await res.json()) as { data?: Array<Record<string, unknown>> };
  const rows = d.data ?? [];
  if (!rows.length) return 'No artworks found.';
  return `Artworks for "${query}" (${rows.length} shown):\n` +
    rows.map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      return `${i + 1}. ${s('title')}${s('artist_title') ? ` by ${s('artist_title')}` : ''}${s('date_display') ? ` (${s('date_display')})` : ''}`;
    }).join('\n');
}

export async function artwork(args: ArtworkArgs): Promise<string> {
  const id = Math.floor(args.id ?? 0);
  if (!id) return 'Provide an artwork id.';
  const res = await fetch(`${BASE}/${id}?fields=id,title,artist_title,date_display,medium_display,description,image_id`, {
    headers: { 'User-Agent': 'mrfentmen-artic-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Artic returned ${res.status}`);
  const d = (await res.json()) as { data?: Record<string, unknown> };
  const r = d.data;
  if (!r) return `No artwork with id ${id}.`;
  const s = (k: string) => (r[k] != null ? String(r[k]) : '');
  return [
    `${s('title')}${s('artist_title') ? ` by ${s('artist_title')}` : ''}`,
    s('date_display') ? `Date: ${s('date_display')}` : '',
    s('medium_display') ? `Medium: ${s('medium_display')}` : '',
    s('description') ? `\n${s('description').replace(/<[^>]+>/g, '')}` : '',
  ].filter(Boolean).join('\n');
}
