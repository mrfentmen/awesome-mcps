const UA = 'mrfentmen-envirocar-mcp/1.0';
const BASE = 'https://envirocar.org/api/stable';

export interface TrackArgs {
  limit?: number;
}
export interface TrackDetailArgs {
  id: string;
}

interface Track {
  id?: string;
  begin?: string;
  end?: string;
  length?: number;
  sensor?: { type?: string; properties?: { id?: string; model?: string; manufacturer?: string } };
  geometry?: { coordinates?: number[][]; type?: string };
}

export async function tracks(args: TrackArgs): Promise<string> {
  const limit = Math.min(Math.max(Number(args?.limit ?? 5) || 5, 1), 20);
  const res = await fetch(`${BASE}/tracks?limit=${limit}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`enviroCar returned ${res.status}`);
  const d = (await res.json()) as { tracks?: Track[] };
  const list = d.tracks ?? [];
  if (!list.length) return 'No tracks returned.';
  return `Recent enviroCar tracks (${list.length} shown):\n` + list.map((t, i) => {
    const km = t.length != null ? (t.length / 1000).toFixed(2) : '?';
    return `${i + 1}. ${t.id ?? '?'} | ${km} km | ${t.begin ?? '?'} to ${t.end ?? '?'} | sensor ${t.sensor?.properties?.model ?? t.sensor?.type ?? '?'}`;
  }).join('\n');
}

export async function trackDetail(args: TrackDetailArgs): Promise<string> {
  const res = await fetch(`${BASE}/tracks/${encodeURIComponent(args.id)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`enviroCar returned ${res.status}`);
  const d = (await res.json()) as Track & { properties?: Array<{ name?: string; value?: number; unit?: string }> };
  if (!d.id) throw new Error('No track returned.');
  const props = d.properties ?? [];
  const first = d.geometry?.coordinates?.[0];
  return `Track ${d.id}\nBegin: ${d.begin ?? '?'}\nEnd: ${d.end ?? '?'}\nLength: ${d.length != null ? `${(d.length / 1000).toFixed(2)} km` : '?'}\nStart: ${first ? `${first[1].toFixed(5)}, ${first[0].toFixed(5)}` : '?'}\nSensor: ${d.sensor?.properties?.manufacturer ?? ''} ${d.sensor?.properties?.model ?? ''} (${d.sensor?.type ?? '?'})\nMeasurements: ${props.length}\nSample: ${props.slice(0, 8).map((p) => `${p.name}=${p.value}${p.unit ? p.unit : ''}`).join(', ') || 'none'}`;
}

export async function sensors(_args?: Record<string, never>): Promise<string> {
  const res = await fetch(`${BASE}/sensors`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`enviroCar returned ${res.status}`);
  const d = (await res.json()) as Array<{ name?: string; quantity?: string; unit?: string }>;
  if (!Array.isArray(d) || !d.length) return 'No sensors returned.';
  return `enviroCar sensors (${d.length}):\n` + d.map((s) => `* ${s.name ?? '?'} (${s.quantity ?? '?'}) [${s.unit ?? '?'}]`).join('\n');
}
