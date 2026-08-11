const UA = 'mrfentmen-data-gouv-mcp/1.0';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide search terms.';
  const limit = Math.min(Math.max(Number(args.limit ?? 5) || 5, 1), 20);
  const url = `https://www.data.gouv.fr/api/1/datasets/?q=${encodeURIComponent(query)}&page_size=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`data.gouv.fr returned ${res.status}`);
  const d = (await res.json()) as { data?: Array<{ title?: string; slug?: string; organization?: { name?: string } | null; nb_views?: number; created_at?: string }> };
  const data = d.data ?? [];
  if (!data.length) return `No datasets for "${query}".`;
  return `data.gouv.fr datasets for "${query}" (${data.length}):\n` +
    data.slice(0, limit).map((x, i) => `${i + 1}. ${x.title ?? '?'} | org: ${x.organization?.name ?? '?'} | views: ${x.nb_views ?? 0} | created: ${String(x.created_at ?? '?').slice(0, 10)}`).join('\n');
}
