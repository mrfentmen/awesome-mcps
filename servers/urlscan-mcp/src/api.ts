const UA = 'mrfentmen-urlscan-mcp/1.0';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide search terms like domain:github.com.';
  const limit = Math.min(Math.max(Number(args?.limit ?? 5) || 5, 1), 20);
  const res = await fetch(`https://urlscan.io/api/v1/search/?q=${encodeURIComponent(query)}&size=${limit}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`urlscan.io returned ${res.status}`);
  const d = (await res.json()) as { total?: number; results?: Array<{ task?: { url?: string; time?: string; visibility?: string }; result?: string }> };
  const list = d.results ?? [];
  if (!list.length) return `No urlscan results for "${query}".`;
  return `urlscan.io results for "${query}" (${d.total ?? list.length} total, showing ${Math.min(limit, list.length)}):\n` +
    list.slice(0, limit).map((r, i) => `${i + 1}. ${r.task?.url ?? '?'} | ${r.task?.time ?? '?'} | visibility: ${r.task?.visibility ?? '?'}`).join('\n');
}
