const BASE = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

export interface RecentArgs {
  minMagnitude?: number;
  limit?: number;
}

export async function recent(args: RecentArgs = {}): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-usgs-earthquakes-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`USGS returned ${res.status}`);
  const data = (await res.json()) as {
    features?: Array<{ properties?: Record<string, unknown>; geometry?: { coordinates?: number[] } }>;
  };
  const minMag = typeof args.minMagnitude === 'number' ? args.minMagnitude : 0;
  const limit = Math.max(1, Math.min(args.limit ?? 15, 50));
  const quakes = (data.features ?? [])
    .filter((f) => (f.properties?.mag as number | undefined) ?? 0 >= minMag)
    .slice(0, limit);
  if (!quakes.length) return 'No earthquakes recorded in the last day.';
  return `Earthquakes in the last day (${quakes.length} shown):\n` +
    quakes
      .map((q, i) => {
        const p = q.properties ?? {};
        const coords = q.geometry?.coordinates ?? [];
        const place = p.place ?? 'unknown location';
        const mag = typeof p.mag === 'number' ? `M${p.mag.toFixed(1)}` : 'no magnitude';
        return `${i + 1}. ${mag} | ${place} | ${p.time ? new Date(Number(p.time)).toISOString().slice(0, 16).replace('T', ' ') : ''}${coords.length ? `\n   lat ${coords[1]} lon ${coords[0]}` : ''}`;
      })
      .join('\n');
}
