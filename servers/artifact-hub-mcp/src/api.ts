const BASE = 'https://artifacthub.io/api/v1/packages/search';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const params = new URLSearchParams({ ts_query_web: q, limit: String(limit) });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-artifact-hub-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Artifact Hub returned ${res.status}`);
  const d = (await res.json()) as { packages?: Array<Record<string, unknown>> };
  const rows = d.packages ?? [];
  if (!rows.length) return `No Artifact Hub packages found for "${q}".`;
  return `Artifact Hub packages for "${q}" (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('name')}${s('version') ? ` ${s('version')}` : ''}${s('description') ? ` | ${s('description').slice(0, 90)}` : ''}${s('repository') ? ` | repo ${s('repository')}` : ''}`;
      })
      .join('\n');
}
