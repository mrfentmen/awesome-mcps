const BASE = 'https://api.wellcomecollection.org/catalogue/v2/works';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}?query=${encodeURIComponent(query)}&pageSize=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-wellcome-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Wellcome returned ${res.status}`);
  const d = (await res.json()) as { results?: Array<Record<string, unknown>> };
  const rows = d.results ?? [];
  if (!rows.length) return `No works found for "${query}".`;
  return `Wellcome works for "${query}" (${rows.length} shown):\n` +
    rows.map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      const workType = (r.workType ?? {}) as Record<string, unknown>;
      const contrib = (r.contributions ?? []) as Array<Record<string, unknown>>;
      const agents = contrib.slice(0, 2).map((c) => String(((c.agent as Record<string, unknown> | undefined) ?? {}).label ?? '')).join(', ');
      return `${i + 1}. ${s('title')}${agents ? ` | ${agents}` : ''} | ${String(workType.label ?? '')}`;
    }).join('\n');
}
