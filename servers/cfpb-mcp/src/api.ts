const UA = 'mrfentmen-cfpb-mcp/1.0';

export interface SearchArgs {
  company: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const company = (args.company ?? '').trim();
  if (!company) return 'Provide a company name.';
  const limit = Math.min(Math.max(Number(args.limit ?? 5) || 5, 1), 20);
  const url = `https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/?search_term=${encodeURIComponent(company)}&size=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`CFPB returned ${res.status}`);
  const d = (await res.json()) as { hits?: { total?: number | { value?: number }; hits?: Array<{ _source?: Record<string, unknown> }> } };
  const hits = d.hits?.hits ?? [];
  if (!hits.length) return `No CFPB complaints for "${company}".`;
  const total = typeof d.hits?.total === 'number' ? d.hits.total : d.hits?.total?.value ?? hits.length;
  const get = (h: Record<string, unknown>, k: string) => String(h[k] ?? '?');
  return `CFPB complaints for "${company}" (${total} total):\n` +
    hits.slice(0, limit).map((h, i) => {
      const s = h._source ?? {};
      return `${i + 1}. ${get(s, 'complaint_what_happened')?.slice(0, 120) || get(s, 'product')} | product: ${get(s, 'product')} | company: ${get(s, 'company')} | date: ${get(s, 'date_received')}`;
    }).join('\n');
}
