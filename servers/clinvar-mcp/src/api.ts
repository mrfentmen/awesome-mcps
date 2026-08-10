const BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/esearch.fcgi?db=clinvar&term=${encodeURIComponent(query)}&retmode=json&retmax=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-clinvar-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`ClinVar returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const er = (d.esearchresult ?? {}) as Record<string, unknown>;
  const ids = (er.idlist ?? []) as Array<unknown>;
  const count = String(er.count ?? '0');
  if (!ids.length) return `No ClinVar records for "${query}".`;
  return `ClinVar records for "${query}" (${ids.length} shown of ${count}):\n` +
    ids.map((id, i) => `${i + 1}. VCV${String(id)}`).join('\n');
}
