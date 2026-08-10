const BASE = 'https://www.episodate.com/api';
const UA = 'mrfentmen-episodate-mcp/1.0';

export interface SearchArgs {
  query: string;
}

export interface ShowArgs {
  id: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide a show name.';
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}&page=1`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Episodate returned ${res.status}`);
  const d = (await res.json()) as { total?: number; tv_shows?: Array<{ id?: number; name?: string; status?: string; start_date?: string; network?: string }> };
  const shows = d.tv_shows ?? [];
  if (!shows.length) return `No shows found for "${query}".`;
  return `Episodate results for "${query}" (total ${d.total ?? shows.length}):\n` +
    shows.map((s, i) => `${i + 1}. ${s.name ?? '?'} (id=${s.id ?? '?'}) [${s.status ?? '?'}] ${s.network ?? ''}`.trim()).join('\n');
}

export async function show(args: ShowArgs): Promise<string> {
  const id = Number(args.id);
  if (!Number.isFinite(id) || id <= 0) return 'Provide a show id.';
  const res = await fetch(`${BASE}/show-details?thetvdb=${id}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Episodate returned ${res.status}`);
  const d = (await res.json()) as {
    tvShow?: {
      id?: number;
      name?: string;
      permalink?: string;
      start_date?: string;
      end_date?: string;
      country?: string;
      network?: string;
      status?: string;
      description?: string;
      image_thumbnail_path?: string;
      rating?: string;
      episodes?: Array<{ name?: string; episode?: number; season?: number; air_date?: string }>;
    };
  };
  const s = d.tvShow ?? {};
  return [
    `Show #${s.id ?? id}: ${s.name ?? '?'}`,
    `Status: ${s.status ?? '?'} | ${s.start_date ?? '?'} - ${s.end_date ?? 'n/a'}`,
    `${s.country ?? '?'} on ${s.network ?? '?'} | Rating: ${s.rating ?? '?'}`,
    s.description ? `Description: ${s.description.slice(0, 300)}` : null,
    s.image_thumbnail_path ? `Image: ${s.image_thumbnail_path}` : null,
    (s.episodes ?? []).length ? `Latest episodes:\n${(s.episodes ?? []).slice(-5).map((e) => `  S${e.season ?? '?'}E${e.episode ?? '?'} ${e.name ?? '?'} (${e.air_date ?? ''})`).join('\n')}` : null,
    `Permalink: ${s.permalink ?? ''}`,
  ].filter(Boolean).join('\n');
}
