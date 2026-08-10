const BASE = 'https://api.discogs.com';
const UA = 'mrfentmen-discogs-mcp/1.0 +https://github.com/mrfentmen/discogs-mcp';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export interface ReleaseArgs {
  id: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide search terms.';
  const limit = Math.min(Math.max(Number(args.limit ?? 10) || 10, 1), 25);
  const res = await fetch(`${BASE}/database/search?q=${encodeURIComponent(query)}&per_page=${limit}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Discogs returned ${res.status}`);
  const d = (await res.json()) as { results?: Array<{ id?: number; title?: string; type?: string; year?: string; format?: string[] }> };
  const results = d.results ?? [];
  if (!results.length) return `No Discogs results for "${query}".`;
  return `Discogs results for "${query}":\n` +
    results.slice(0, limit).map((r, i) => `${i + 1}. [${r.type ?? '?'}] ${r.title ?? '?'} (${r.year ?? '?'}) id=${r.id ?? '?'}`).join('\n');
}

export async function release(args: ReleaseArgs): Promise<string> {
  const id = Number(args.id);
  if (!Number.isFinite(id) || id <= 0) return 'Provide a release id.';
  const res = await fetch(`${BASE}/releases/${id}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Discogs returned ${res.status}`);
  const d = (await res.json()) as {
    title?: string;
    artists?: Array<{ name?: string }>;
    year?: number;
    genres?: string[];
    styles?: string[];
    country?: string;
    labels?: Array<{ name?: string }>;
    tracklist?: Array<{ position?: string; title?: string; duration?: string }>;
  };
  return [
    `Discogs release #${id}`,
    `Title: ${d.title ?? '?'}`,
    `Artist: ${(d.artists ?? []).map((a) => a.name ?? '?').join(', ') || '?'}`,
    `Year: ${d.year ?? '?'} | Country: ${d.country ?? '?'}`,
    d.genres?.length ? `Genres: ${d.genres.join(', ')}` : null,
    d.styles?.length ? `Styles: ${d.styles.join(', ')}` : null,
    d.labels?.length ? `Label: ${(d.labels[0] ?? {}).name ?? '?'}` : null,
    (d.tracklist ?? []).length ? `Tracks:\n${(d.tracklist ?? []).slice(0, 20).map((t) => `  ${t.position ?? '?'}. ${t.title ?? '?'} ${t.duration ?? ''}`).join('\n')}` : null,
  ].filter(Boolean).join('\n');
}
