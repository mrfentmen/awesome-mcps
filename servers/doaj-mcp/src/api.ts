const BASE = 'https://doaj.org/api';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/search/articles/${encodeURIComponent(query)}?pageSize=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-doaj-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`DOAJ returned ${res.status}`);
  const d = (await res.json()) as { results?: Array<Record<string, unknown>> };
  const rows = d.results ?? [];
  if (!rows.length) return `No articles found for "${query}".`;
  return `Open access articles for "${query}" (${rows.length} shown):\n` +
    rows.map((r, i) => {
      const bib = (r.bibjson ?? {}) as Record<string, unknown>;
      const title = (bib.title ?? '') as string;
      const authors = (bib.author ?? []) as Array<Record<string, unknown>>;
      const auth = authors.slice(0, 2).map((a) => String(a.name ?? '')).join(', ');
      const jr = (bib.journal ?? {}) as Record<string, unknown>;
      return `${i + 1}. ${title}${auth ? ` | ${auth}` : ''} | ${String(jr.title ?? '')}`;
    }).join('\n');
}

export async function journal(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide a journal name.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/search/journals/${encodeURIComponent(query)}?pageSize=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-doaj-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`DOAJ returned ${res.status}`);
  const d = (await res.json()) as { results?: Array<Record<string, unknown>> };
  const rows = d.results ?? [];
  if (!rows.length) return `No journals found for "${query}".`;
  return `Open access journals for "${query}" (${rows.length} shown):\n` +
    rows.map((r, i) => {
      const bib = (r.bibjson ?? {}) as Record<string, unknown>;
      const title = (bib.title ?? '') as string;
      const issn = (bib.issn ?? []) as Array<unknown>;
      const p = (bib.publisher ?? {}) as Record<string, unknown>;
      return `${i + 1}. ${title}${Array.isArray(issn) && issn.length ? ` | ISSN ${issn.join(', ')}` : ''} | ${String(p.name ?? '')}`;
    }).join('\n');
}
