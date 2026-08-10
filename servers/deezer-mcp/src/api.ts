const BASE = 'https://api.deezer.com/search';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const url = `${BASE}?q=${encodeURIComponent(q)}&limit=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-deezer-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Deezer returned ${res.status}`);
  const data = (await res.json()) as {
    total?: number;
    data?: Array<{
      title?: string;
      artist?: { name?: string };
      album?: { title?: string };
      duration?: number;
      link?: string;
    }>;
  };
  const tracks = (data.data ?? []).slice(0, limit);
  if (!tracks.length) return `No Deezer tracks for "${q}".`;
  return `Deezer tracks for "${q}" (${data.total ?? tracks.length} total, ${tracks.length} shown):\n` +
    tracks
      .map((t, i) => {
        const dur = t.duration ? `${Math.floor(t.duration / 60)}:${String(t.duration % 60).padStart(2, '0')}` : '';
        return `${i + 1}. ${t.title ?? 'untitled'} | ${t.artist?.name ?? ''} | ${t.album?.title ?? ''} | ${dur}`;
      })
      .join('\n');
}
