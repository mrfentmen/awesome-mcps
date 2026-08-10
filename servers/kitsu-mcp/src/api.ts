const BASE = 'https://kitsu.io/api/edge/anime';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export interface TrendingArgs {
  limit?: number;
}

interface KitsuAnime {
  id?: string;
  attributes?: {
    canonicalTitle?: string;
    averageRating?: string;
    episodeCount?: number;
    status?: string;
    startDate?: string;
    posterImage?: { large?: string };
    synopsis?: string;
  };
}

function formatAnime(rows: KitsuAnime[]): string {
  return rows
    .map((a, i) => {
      const attrs = a.attributes ?? {};
      return `${i + 1}. ${attrs.canonicalTitle ?? 'untitled'} | ${attrs.averageRating ? `${attrs.averageRating}%` : 'no rating'} | ${attrs.episodeCount ?? '?'} eps | ${attrs.status ?? ''} | ${attrs.startDate ?? ''}${attrs.posterImage?.large ? `\n   ${attrs.posterImage.large}` : ''}`;
    })
    .join('\n');
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 20));
  const res = await fetch(`${BASE}?filter[text]=${encodeURIComponent(q)}&page[limit]=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-kitsu-mcp/1.0', Accept: 'application/vnd.api+json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Kitsu returned ${res.status}`);
  const data = (await res.json()) as { data?: KitsuAnime[] };
  const rows = data.data ?? [];
  if (!rows.length) return `No anime found for "${q}".`;
  return `Kitsu anime for "${q}" (${rows.length} shown):\n` + formatAnime(rows);
}

export async function trending(args: TrendingArgs = {}): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 20));
  const res = await fetch(`${BASE}?sort=-userCount&page[limit]=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-kitsu-mcp/1.0', Accept: 'application/vnd.api+json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Kitsu returned ${res.status}`);
  const data = (await res.json()) as { data?: KitsuAnime[] };
  const rows = data.data ?? [];
  if (!rows.length) return 'No trending anime right now.';
  return `Trending anime on Kitsu (${rows.length} shown):\n` + formatAnime(rows);
}
