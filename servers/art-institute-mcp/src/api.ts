
export interface m0_SearchArgs {
  query: string;
  limit?: number;
}

export interface m0_ArtworkArgs {
  id: number;
}

export interface m1_SearchArgs {
  query: string;
  limit?: number;
}

export interface m1_ArtworkArgs {
  id: number;
}

const m0 = (() => {
const BASE = 'https://api.artic.edu/api/v1';



function pick<T>(obj: Record<string, unknown>, key: string): T {
  return (obj?.[key] as T) ?? ('' as T);
}

function firstText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((v) => (typeof v === 'string' ? v : '')).filter(Boolean).join(', ');
  return '';
}

async function search(args: m0_SearchArgs): Promise<string> {
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

async function artwork(args: m0_ArtworkArgs): Promise<string> {
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

return { artwork, search };
})();

const m1 = (() => {
const BASE = 'https://api.artic.edu/api/v1/artworks';



async function search(args: m1_SearchArgs): Promise<string> {
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

async function artwork(args: m1_ArtworkArgs): Promise<string> {
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

return { artwork, search };
})();

export const artwork = m0.artwork;
export const search = m0.search;
export const m0_search = m0.search;
export const m0_artwork = m0.artwork;
export const m1_search = m1.search;
export const m1_artwork = m1.artwork;
