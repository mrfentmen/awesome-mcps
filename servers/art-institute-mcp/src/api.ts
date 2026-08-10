const BASE = 'https://api.artic.edu/api/v1';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export interface ArtworkArgs {
  id: number;
}

function pick<T>(obj: Record<string, unknown>, key: string): T {
  return (obj?.[key] as T) ?? ('' as T);
}

function firstText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((v) => (typeof v === 'string' ? v : '')).filter(Boolean).join(', ');
  return '';
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const url = `${BASE}/artworks/search?q=${encodeURIComponent(q)}&limit=${limit}&fields=id,title,artist_title,date_display,image_id`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-art-institute-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Art Institute search returned ${res.status}`);
  const data = (await res.json()) as { data?: unknown[] };
  const rows = (data.data ?? []).map((d) => {
    const o = d as Record<string, unknown>;
    const imageId = pick<string>(o, 'image_id');
    return `${pick<string>(o, 'title')} | ${firstText(pick(o, 'artist_title'))} | ${pick<string>(o, 'date_display')} | id ${pick<number>(o, 'id')}${imageId ? ` | image https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg` : ''}`;
  });
  if (!rows.length) return `No artworks found for "${q}".`;
  return `Art Institute results for "${q}" (${rows.length} shown):\n` + rows.map((r, i) => `${i + 1}. ${r}`).join('\n');
}

export async function artwork(args: ArtworkArgs): Promise<string> {
  const url = `${BASE}/artworks/${args.id}?fields=id,title,artist_title,date_display,medium_display,description,image_id`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-art-institute-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Art Institute fetch returned ${res.status}`);
  const data = (await res.json()) as { data?: unknown };
  const o = (data.data ?? {}) as Record<string, unknown>;
  const imageId = pick<string>(o, 'image_id');
  const lines = [
    `Title: ${pick<string>(o, 'title')}`,
    `Artist: ${firstText(pick(o, 'artist_title'))}`,
    `Date: ${pick<string>(o, 'date_display')}`,
    `Medium: ${pick<string>(o, 'medium_display')}`,
  ];
  const desc = pick<string>(o, 'description');
  if (desc) lines.push(`Description: ${desc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400)}`);
  if (imageId) lines.push(`Image: https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`);
  return lines.join('\n');
}
