const BASE = 'https://data.gov.uk/api/3/action/package_search';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const params = new URLSearchParams({ q, rows: String(limit) });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-data-gov-uk-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`data.gov.uk returned ${res.status}`);
  const d = (await res.json()) as { result?: { count?: number; results?: Array<Record<string, unknown>> } };
  const rows = d.result?.results ?? [];
  if (!rows.length) return `No data.gov.uk packages found for "${q}".`;
  return `data.gov.uk packages for "${q}" (${d.result?.count ?? rows.length} total, ${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('title')}${s('notes') ? ` | ${s('notes').slice(0, 90)}` : ''}${s('metadata_modified') ? ` | ${String(s('metadata_modified')).slice(0, 10)}` : ''}`;
      })
      .join('\n');
}
