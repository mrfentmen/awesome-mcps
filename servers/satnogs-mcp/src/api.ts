const UA = 'mrfentmen-satnogs-mcp/1.0';
const BASE = 'https://db.satnogs.org/api';

export interface LimitArgs {
  limit?: number;
}
export interface ModeArgs {
  mode: string;
  limit?: number;
}

export async function transmitters(args: LimitArgs): Promise<string> {
  const limit = Math.min(Math.max(Number(args?.limit ?? 10) || 10, 1), 25);
  const res = await fetch(`${BASE}/transmitters/?format=json`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`SatNOGS returned ${res.status}`);
  const d = (await res.json()) as Array<{ uuid?: string; description?: string; alive?: boolean; mode?: string; uplink_low?: number | null; downlink_low?: number | null; norad_cat_id?: number | null }>;
  if (!Array.isArray(d) || !d.length) return 'No transmitters returned.';
  return `SatNOGS transmitters (${d.length} shown):\n` + d.slice(0, limit).map((t, i) => `${i + 1}. ${t.norad_cat_id ?? '?'} ${(t.description ?? '').slice(0, 60)} | ${t.mode ?? '?'} | ${t.downlink_low ?? '?'} MHz${t.alive ? '' : ' (dead)'}`).join('\n');
}

export async function byMode(args: ModeArgs): Promise<string> {
  const limit = Math.min(Math.max(Number(args?.limit ?? 10) || 10, 1), 25);
  const res = await fetch(`${BASE}/transmitters/?format=json&mode=${encodeURIComponent(args.mode)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`SatNOGS returned ${res.status}`);
  const d = (await res.json()) as Array<{ uuid?: string; description?: string; alive?: boolean; mode?: string; downlink_low?: number | null; norad_cat_id?: number | null }>;
  if (!Array.isArray(d) || !d.length) return `No transmitters with mode "${args.mode}".`;
  return `SatNOGS transmitters in mode ${args.mode} (${d.length}):\n` + d.slice(0, limit).map((t, i) => `${i + 1}. ${t.norad_cat_id ?? '?'} ${(t.description ?? '').slice(0, 60)} | ${t.downlink_low ?? '?'} MHz${t.alive ? '' : ' (dead)'}`).join('\n');
}
