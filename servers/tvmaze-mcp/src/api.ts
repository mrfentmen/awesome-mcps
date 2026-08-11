const UA = 'mrfentmen-tvmaze-mcp/1.0';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export interface ScheduleArgs {
  country?: string;
  date?: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide a show name.';
  const limit = Math.min(Math.max(Number(args.limit ?? 5) || 5, 1), 20);
  const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`TVMaze returned ${res.status}`);
  const d = (await res.json()) as Array<{ show?: { id?: number; name?: string; premiered?: string; status?: string; genres?: string[]; rating?: { average?: number | null } } }>;
  if (!d.length) return `No shows for "${query}".`;
  return `TVMaze shows for "${query}":\n` +
    d.slice(0, limit).map((x, i) => {
      const s = x.show ?? {};
      return `${i + 1}. ${s.name ?? '?'} (${s.premiered?.slice(0, 4) ?? '?'}) | status: ${s.status ?? '?'} | genres: ${(s.genres ?? []).join(', ') || '?'} | rating: ${s.rating?.average ?? '?'}`;
    }).join('\n');
}

export async function schedule(args: ScheduleArgs): Promise<string> {
  const country = (args?.country ?? 'US').trim();
  const date = (args?.date ?? '').trim();
  const limit = Math.min(Math.max(Number(args?.limit ?? 5) || 5, 1), 20);
  const url = date
    ? `https://api.tvmaze.com/schedule?country=${encodeURIComponent(country)}&date=${encodeURIComponent(date)}`
    : `https://api.tvmaze.com/schedule?country=${encodeURIComponent(country)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`TVMaze returned ${res.status}`);
  const d = (await res.json()) as Array<{ id?: number; name?: string; airdate?: string; airtime?: string; show?: { name?: string } }>;
  if (!d.length) return 'No schedule entries found.';
  return `TVMaze schedule for ${country}${date ? ` on ${date}` : ''}: (${d.length} entries, showing ${Math.min(limit, d.length)})\n` +
    d.slice(0, limit).map((x, i) => `${i + 1}. ${x.show?.name ?? '?'} - ${x.name ?? '?'} (${x.airdate ?? '?'} ${x.airtime ?? '?'})`).join('\n');
}
