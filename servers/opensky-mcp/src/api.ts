const BASE = 'https://opensky-network.org/api/states/all';

export interface AreaArgs {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
  limit?: number;
}

export async function area(args: AreaArgs): Promise<string> {
  const minLat = Number(args.minLat);
  const minLon = Number(args.minLon);
  const maxLat = Number(args.maxLat);
  const maxLon = Number(args.maxLon);
  if ([minLat, minLon, maxLat, maxLon].some((n) => !Number.isFinite(n))) return 'Provide a valid bounding box.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const params = new URLSearchParams({
    lamin: String(Math.min(minLat, maxLat)),
    lomin: String(Math.min(minLon, maxLon)),
    lamax: String(Math.max(minLat, maxLat)),
    lomax: String(Math.max(minLon, maxLon)),
  });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-opensky-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`OpenSky returned ${res.status}`);
  const d = (await res.json()) as { states?: Array<Array<unknown>> };
  const states = d.states ?? [];
  if (!states.length) return 'No flights in that area.';
  const rows = states.slice(0, limit).map((st) => {
    const callsign = String(st[1] ?? '').trim() || 'unknown';
    const alt = Number(st[7] ?? 0);
    const vel = Number(st[9] ?? 0);
    const country = String(st[2] ?? '');
    return `${callsign} | ${country} | ${alt ? (alt * 0.3048).toFixed(0) + ' m' : 'ground'} | ${vel ? Math.round(vel * 1.852) + ' km/h' : ''}`;
  });
  return `Flights in area (${rows.length} shown of ${states.length}):\n` + rows.join('\n');
}
