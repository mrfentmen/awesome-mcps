const BASE = 'https://favqs.com/api';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function qotd(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/qotd`, {
    headers: { 'User-Agent': 'mrfentmen-favqs-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`FavQs returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const q = (d.quote ?? {}) as Record<string, unknown>;
  const s = (k: string) => (q[k] != null ? String(q[k]) : '');
  const a = (q.author ?? {}) as Record<string, unknown>;
  return [
    `Quote of the day:`,
    `"${s('body')}"`,
    `- ${String(a.name ?? s('author') ?? 'unknown')}`,
  ].filter(Boolean).join('\n');
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/quotes?filter=${encodeURIComponent(query)}&page=1`, {
    headers: { 'User-Agent': 'mrfentmen-favqs-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`FavQs returned ${res.status}`);
  const d = (await res.json()) as { quotes?: Array<Record<string, unknown>> };
  const rows = d.quotes ?? [];
  if (!rows.length) return `No quotes for "${query}".`;
  return `Quotes for "${query}" (${Math.min(rows.length, limit)} shown):\n` +
    rows.slice(0, limit).map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      return `${i + 1}. "${s('body')}" - ${s('author')}`;
    }).join('\n');
}
