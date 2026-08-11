const BASE = 'https://graphql.anilist.co';
const UA = 'mrfentmen-anilist-mcp/1.0 (https://github.com/mrfentmen)';
export class AnilistError extends Error {}

async function query<T>(ql: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'User-Agent': UA, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: ql, variables }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new AnilistError(`AniList returned ${res.status}`);
  const d = (await res.json()) as { data?: T; errors?: Array<{ message?: string }> };
  if (d.errors?.length) throw new AnilistError(d.errors[0].message ?? 'AniList error');
  if (!d.data) throw new AnilistError('AniList returned no data');
  return d.data;
}

const SEARCH_QL = `
query($search: String, $type: MediaType, $perPage: Int) {
  Page(page: 1, perPage: $perPage) {
    media(search: $search, type: $type) {
      id
      title { romaji english }
      format
      episodes
      chapters
      averageScore
      status
      seasonYear
      genres
      description(asHtml: false)
      siteUrl
    }
  }
}`;

interface Media {
  id?: number;
  title?: { romaji?: string; english?: string };
  format?: string;
  episodes?: number;
  chapters?: number;
  averageScore?: number;
  status?: string;
  seasonYear?: number;
  genres?: string[];
  description?: string;
  siteUrl?: string;
}

function fmt(m: Media): string {
  const t = m.title?.english ?? m.title?.romaji ?? '?';
  return [
    `${t} (${m.format ?? '?'}${m.seasonYear ? `, ${m.seasonYear}` : ''})`,
    m.episodes ? `Episodes: ${m.episodes}` : m.chapters ? `Chapters: ${m.chapters}` : '',
    `Score: ${m.averageScore ?? '?'} | Status: ${m.status ?? '?'}`,
    m.genres?.length ? `Genres: ${m.genres.join(', ')}` : '',
    (m.description ?? '').replace(/<[^>]*>/g, '').slice(0, 200),
    m.siteUrl ?? '',
  ].filter(Boolean).join('\n');
}

export async function searchAnime(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) throw new AnilistError('Provide a search query');
  const limit = Math.max(1, Math.min(args.limit ?? 5, 15));
  const d = await query<{ Page: { media: Media[] } }>(SEARCH_QL, { search: q, type: 'ANIME', perPage: limit });
  const list = d.Page.media;
  if (!list.length) return `No anime found for "${q}".`;
  return `AniList anime for "${q}":\n` + list.map((m) => fmt(m)).join('\n\n');
}

export async function searchManga(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) throw new AnilistError('Provide a search query');
  const limit = Math.max(1, Math.min(args.limit ?? 5, 15));
  const d = await query<{ Page: { media: Media[] } }>(SEARCH_QL, { search: q, type: 'MANGA', perPage: limit });
  const list = d.Page.media;
  if (!list.length) return `No manga found for "${q}".`;
  return `AniList manga for "${q}":\n` + list.map((m) => fmt(m)).join('\n\n');
}
