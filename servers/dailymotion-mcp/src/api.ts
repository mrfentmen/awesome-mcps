const BASE = 'https://api.dailymotion.com/videos';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const res = await fetch(`${BASE}?search=${encodeURIComponent(q)}&limit=${limit}&fields=id,title,url,duration,views_total`, {
    headers: { 'User-Agent': 'mrfentmen-dailymotion-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Dailymotion returned ${res.status}`);
  const data = (await res.json()) as {
    total?: number;
    list?: Array<Record<string, unknown>>;
  };
  const rows = data.list ?? [];
  if (!rows.length) return `No Dailymotion videos for "${q}".`;
  return `Dailymotion videos for "${q}" (${data.total ?? rows.length} total, ${rows.length} shown):\n` +
    rows
      .map((v, i) => {
        const dur = typeof v.duration === 'number' ? `${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2, '0')}` : '';
        const views = typeof v.views_total === 'number' ? ` | ${v.views_total.toLocaleString()} views` : '';
        return `${i + 1}. ${v.title ?? 'untitled'} | ${dur}${views}\n   ${v.url ?? ''}`;
      })
      .join('\n');
}
