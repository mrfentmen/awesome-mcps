const BASE = 'https://api.open.fec.gov/v1/candidates';

export interface CandidatesArgs {
  query: string;
  limit?: number;
}

export async function candidates(args: CandidatesArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a candidate name.';
  const limit = Math.max(1, Math.min(args.limit ?? 5, 15));
  const params = new URLSearchParams({ api_key: 'DEMO_KEY', per_page: String(limit), q });
  const res = await fetch(`${BASE}/?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-fec-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`FEC returned ${res.status}`);
  const data = (await res.json()) as {
    results?: Array<{ name?: string; party?: string; state?: string; office?: string; candidate_id?: string; district?: string }>;
    pagination?: { count?: number };
  };
  const rows = data.results ?? [];
  if (!rows.length) return `No candidates found for "${q}".`;
  return `FEC candidates for "${q}" (${data.pagination?.count ?? rows.length} total, ${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const office = r.office === 'H' ? 'House' : r.office === 'S' ? 'Senate' : r.office === 'P' ? 'President' : r.office ?? '';
        return `${i + 1}. ${r.name ?? ''}${r.party ? ` (${r.party})` : ''}${office ? ` | ${office}` : ''}${r.state ? ` | ${r.state}${r.district ? `-${r.district}` : ''}` : ''}`;
      })
      .join('\n');
}
