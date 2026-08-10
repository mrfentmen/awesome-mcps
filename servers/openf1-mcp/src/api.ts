const BASE = 'https://api.openf1.org/v1';
const HEADERS = { 'User-Agent': 'mrfentmen-openf1-mcp/1.0', Accept: 'application/json' };

export interface RacesArgs {
  year?: number;
}

export interface DriversArgs {
  session?: number;
  limit?: number;
}

export async function races(args: RacesArgs): Promise<string> {
  const year = Number(args?.year ?? new Date().getFullYear());
  const res = await fetch(`${BASE}/meetings?year=${year}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`OpenF1 returned ${res.status}`);
  const d = (await res.json()) as Array<{ meeting_key?: number; meeting_name?: string; meeting_official_name?: string; country_name?: string; date_start?: string }>;
  if (!Array.isArray(d) || !d.length) return `No ${year} race weekends found.`;
  return `OpenF1 ${year} race weekends (${d.length}):\n` +
    d.slice(0, 25).map((r, i) => `${i + 1}. ${r.meeting_name ?? r.meeting_official_name ?? '?'} - ${r.country_name ?? ''} (${String(r.date_start ?? '').slice(0, 10)}) key=${r.meeting_key ?? '?'}`.trim()).join('\n');
}

export async function drivers(args: DriversArgs): Promise<string> {
  const limit = Math.min(Math.max(Number(args?.limit ?? 20) || 20, 1), 60);
  const q = args?.session ? `?session_key=${Number(args.session)}` : '?session_key=latest';
  const res = await fetch(`${BASE}/drivers${q}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`OpenF1 returned ${res.status}`);
  const d = (await res.json()) as Array<{ full_name?: string; driver_number?: number; team_name?: string; session_key?: number }>;
  if (!Array.isArray(d) || !d.length) return 'No drivers found.';
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const drv of d) {
    const key = `${drv.full_name ?? drv.driver_number ?? '?'}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(`${rows.length + 1}. ${drv.full_name ?? '?'} (#${drv.driver_number ?? '?'}) - ${drv.team_name ?? '?'}`);
    if (rows.length >= limit) break;
  }
  return `OpenF1 drivers (${rows.length}):\n${rows.join('\n')}`;
}
