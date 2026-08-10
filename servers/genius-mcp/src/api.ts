const BASE = 'https://genius.com/api/search/multi';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 20));
  const res = await fetch(`${BASE}?q=${encodeURIComponent(q)}`, {
    headers: { 'User-Agent': 'mrfentmen-genius-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Genius returned ${res.status}`);
  const data = (await res.json()) as {
    response?: { sections?: Array<{ type?: string; hits?: Array<{ result?: Record<string, unknown> }> }> };
  };
  const sections = data.response?.sections ?? [];
  const rows: string[] = [];
  for (const section of sections) {
    const type = section.type ?? '';
    for (const hit of section.hits ?? []) {
      const r = hit.result ?? {};
      const name = r.name ?? r.title ?? '';
      const artist = r.primary_artist ? String((r.primary_artist as Record<string, unknown>).name ?? '') : '';
      const url = r.url ? String(r.url) : '';
      rows.push(`${name}${artist ? ` by ${artist}` : ''}${type ? ` [${type}]` : ''}${url ? `\n   ${url}` : ''}`);
      if (rows.length >= limit) break;
    }
    if (rows.length >= limit) break;
  }
  if (!rows.length) return `No Genius results for "${q}".`;
  return `Genius results for "${q}" (${rows.length} shown):\n` + rows.map((r, i) => `${i + 1}. ${r}`).join('\n');
}
