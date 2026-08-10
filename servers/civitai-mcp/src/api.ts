const BASE = 'https://civitai.com/api/v1/models';

export interface ModelsArgs {
  limit?: number;
  query?: string;
}

export interface ModelArgs {
  id: number;
}

export async function models(args: ModelsArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const params = new URLSearchParams({ limit: String(limit) });
  if (args.query) params.set('query', args.query.trim());
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-civitai-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Civitai returned ${res.status}`);
  const d = (await res.json()) as { items?: Array<Record<string, unknown>>; metadata?: Record<string, unknown> };
  const rows = d.items ?? [];
  if (!rows.length) return 'No models returned.';
  const label = args.query ? ` for "${args.query.trim()}"` : '';
  return `Civitai models${label} (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        const stats = (r.stats && typeof r.stats === 'object' ? r.stats as Record<string, unknown> : {});
        return `${i + 1}. ${s('name')}${s('type') ? ` [${s('type')}]` : ''}${s('description') ? ` | ${s('description').replace(/<[^>]*>/g, '').slice(0, 80)}` : ''}${stats.downloadCount ? ` | dl ${stats.downloadCount}` : ''}`;
      })
      .join('\n');
}

export async function model(args: ModelArgs): Promise<string> {
  const id = Math.floor(args.id ?? 0);
  if (!id) return 'Provide a numeric model ID.';
  const res = await fetch(`${BASE}/${id}`, {
    headers: { 'User-Agent': 'mrfentmen-civitai-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Civitai returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  const stats = (d.stats && typeof d.stats === 'object' ? d.stats as Record<string, unknown> : {});
  const ss = (k: string) => (stats[k] != null ? String(stats[k]) : '');
  return [
    `${s('name')}${s('type') ? ` [${s('type')}]` : ''}`,
    s('description') ? `Desc: ${s('description').replace(/<[^>]*>/g, '').slice(0, 150)}` : '',
    ss('downloadCount') ? `Downloads: ${ss('downloadCount')}` : '',
    ss('rating') ? `Rating: ${ss('rating')}` : '',
    ss('favoriteCount') ? `Favorites: ${ss('favoriteCount')}` : '',
    s('createdAt') ? `Created: ${String(s('createdAt')).slice(0, 10)}` : '',
  ].filter(Boolean).join('\n') || `No data for model ${id}.`;
}
