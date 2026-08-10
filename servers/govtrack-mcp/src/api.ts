const BASE = 'https://www.govtrack.us/api/v2/bill';

export interface BillsArgs {
  limit?: number;
}

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function bills(args: BillsArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const params = new URLSearchParams({ limit: String(limit), order_by: '-current_status_date' });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-govtrack-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`GovTrack returned ${res.status}`);
  const d = (await res.json()) as { objects?: Array<Record<string, unknown>> };
  const rows = d.objects ?? [];
  if (!rows.length) return 'No bills returned.';
  return `Recent US bills (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('display_number')} ${s('title').slice(0, 90)}${s('current_status_date') ? ` | ${String(s('current_status_date')).slice(0, 10)}` : ''}`;
      })
      .join('\n');
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const params = new URLSearchParams({ q, limit: String(limit) });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-govtrack-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`GovTrack returned ${res.status}`);
  const d = (await res.json()) as { objects?: Array<Record<string, unknown>> };
  const rows = d.objects ?? [];
  if (!rows.length) return `No bills found for "${q}".`;
  return `GovTrack bills for "${q}" (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('display_number')} ${s('title').slice(0, 90)}${s('current_status') ? ` | ${s('current_status')}` : ''}`;
      })
      .join('\n');
}
