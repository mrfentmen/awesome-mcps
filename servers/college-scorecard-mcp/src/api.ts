const BASE = 'https://api.data.gov/ed/collegescorecard/v1/schools';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a college name.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const url = `${BASE}?school.name=${encodeURIComponent(q)}&page=0&per_page=${limit}&api_key=DEMO_KEY&fields=id,school.name,school.city,school.state,latest.student.size,latest.cost.attendance.academic_year,latest.aid.federal_loan_rate`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-college-scorecard-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`College Scorecard returned ${res.status}`);
  const data = (await res.json()) as {
    metadata?: { total?: number };
    results?: Array<Record<string, unknown>>;
  };
  const results = data.results ?? [];
  if (!results.length) return `No colleges found for "${q}".`;
  return `Colleges matching "${q}" (${data.metadata?.total ?? results.length} total, ${results.length} shown):\n` +
    results
      .map((c, i) => {
        const school = (c.school ?? {}) as Record<string, unknown>;
        const latest = (c.latest ?? {}) as Record<string, unknown>;
        const size = (latest.student ?? {}) as Record<string, unknown> | undefined;
        const cost = (latest.cost ?? {}) as Record<string, unknown> | undefined;
        const aid = (latest.aid ?? {}) as Record<string, unknown> | undefined;
        const attendance = (cost?.attendance ?? {}) as Record<string, unknown> | undefined;
        const parts = [
          school.name ?? 'untitled',
          `${school.city ?? ''}, ${school.state ?? ''}`,
          size?.size ? `${Number(size.size).toLocaleString()} students` : '',
          attendance?.['academic_year'] ? `$${Number(attendance['academic_year']).toLocaleString()} cost` : '',
          aid?.federal_loan_rate ? `${Math.round(Number(aid.federal_loan_rate) * 100)}% loans` : '',
        ];
        return `${i + 1}. ${parts.filter(Boolean).join(' | ')}`;
      })
      .join('\n');
}
