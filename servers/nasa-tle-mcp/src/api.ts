const UA = 'mrfentmen-nasa-tle-mcp/1.0';
const BASE = 'https://tle.ivanstanojevic.me/api/tle';

export interface SatIdArg {
  satid: number;
}
export interface SearchArg {
  query: string;
}

export async function satellite(args: SatIdArg): Promise<string> {
  const res = await fetch(`${BASE}/${encodeURIComponent(String(args.satid))}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`TLE API returned ${res.status}`);
  const d = (await res.json()) as { satelliteId?: number; name?: string; date?: string; line1?: string; line2?: string };
  if (!d.name) throw new Error(`No satellite for id ${args.satid}.`);
  return `Satellite ${d.satelliteId ?? args.satid}: ${d.name}\nEpoch: ${d.date ?? '?'}\n${d.line1 ?? ''}\n${d.line2 ?? ''}`;
}

export async function search(args: SearchArg): Promise<string> {
  const res = await fetch(`${BASE}?search=${encodeURIComponent(args.query)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`TLE API returned ${res.status}`);
  const d = (await res.json()) as { member?: Array<{ satelliteId?: number; name?: string }> };
  const list = d.member ?? [];
  if (!list.length) return `No satellites matching "${args.query}".`;
  return `Satellites matching "${args.query}" (${list.length}):\n` + list.slice(0, 15).map((s) => `* ${s.satelliteId ?? '?'} - ${s.name ?? '?'}`).join('\n');
}
