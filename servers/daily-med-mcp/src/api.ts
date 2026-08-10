const BASE = 'https://api.fda.gov/drug/event.json';

export interface EventsArgs {
  drug: string;
  limit?: number;
}

export async function events(args: EventsArgs): Promise<string> {
  const drug = (args.drug ?? '').trim();
  if (!drug) return 'Provide a drug brand name.';
  const limit = Math.max(1, Math.min(args.limit ?? 5, 20));
  const query = `patient.drug.openfda.brand_name:"${drug}"`;
  const url = `${BASE}?search=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-daily-med-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`openFDA returned ${res.status}`);
  const data = (await res.json()) as {
    meta?: { results?: { total?: number } };
    results?: Array<Record<string, unknown>>;
  };
  const rows = data.results ?? [];
  if (!rows.length) return `No FDA event reports found for "${drug}".`;
  return `FDA adverse event reports for "${drug}" (${data.meta?.results?.total ?? rows.length} total, ${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const serious = (r.serious as boolean | undefined) ? 'SERIOUS' : 'not serious';
        const reportDate = r.report_date ? String(r.report_date) : '';
        return `${i + 1}. ${reportDate || 'no date'} | ${serious}${r.reaction ? ` | ${JSON.stringify(r.reaction).slice(0, 100)}` : ''}`;
      })
      .join('\n');
}
