const BASE = 'https://itunes.apple.com/search';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const url = `${BASE}?term=${encodeURIComponent(q)}&limit=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-itunes-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`iTunes returned ${res.status}`);
  const data = (await res.json()) as {
    resultCount?: number;
    results?: Array<{
      kind?: string;
      trackName?: string;
      collectionName?: string;
      artistName?: string;
      releaseDate?: string;
      trackViewUrl?: string;
    }>;
  };
  const results = (data.results ?? []).slice(0, limit);
  if (!results.length) return `No iTunes results for "${q}".`;
  return `iTunes results for "${q}" (${data.resultCount ?? results.length} total, ${results.length} shown):\n` +
    results
      .map((r, i) => `${i + 1}. ${r.trackName ?? r.collectionName ?? 'untitled'} | ${r.artistName ?? ''} | ${r.kind ?? ''} | ${(r.releaseDate ?? '').slice(0, 10)}${r.trackViewUrl ? `\n   ${r.trackViewUrl}` : ''}`)
      .join('\n');
}
