const BASE = 'https://api.congress.gov/v3/bill';

export interface BillsArgs {
  limit?: number;
}

export interface SearchArgs {
  query: string;
  limit?: number;
}

async function getBills(params: URLSearchParams): Promise<string> {
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-congress-gov-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Congress.gov returned ${res.status}`);
  const data = (await res.json()) as {
    bills?: Array<{ number?: string; title?: string; type?: string; congress?: number; updateDate?: string; url?: string }>;
    pagination?: { count?: number };
  };
  const rows = data.bills ?? [];
  if (!rows.length) return 'No bills returned.';
  return `Congress.gov bills (${data.pagination?.count ?? rows.length} total, ${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const num = r.number ? String(r.number).padStart(3, '0') : '';
        return `${i + 1}. ${r.type?.toUpperCase() ?? ''}${r.congress ? `${r.congress}` : ''}-${num} ${r.title ?? ''}${r.updateDate ? ` | ${String(r.updateDate).slice(0, 10)}` : ''}`;
      })
      .join('\n');
}

export async function bills(args: BillsArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const params = new URLSearchParams({ api_key: 'DEMO_KEY', format: 'json', limit: String(limit) });
  return getBills(params);
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const params = new URLSearchParams({ api_key: 'DEMO_KEY', format: 'json', limit: String(limit), query: q });
  return getBills(params);
}
