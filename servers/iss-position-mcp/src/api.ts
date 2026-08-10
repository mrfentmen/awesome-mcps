const BASE = 'https://api.wheretheiss.at/v1/satellites/25544';

export async function position(_args: Record<string, never> = {}): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-iss-position-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Where The ISS At returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const lines = [
    `ISS position:`,
    `Latitude: ${d.latitude}`,
    `Longitude: ${d.longitude}`,
    `Altitude: ${Number(d.altitude ?? 0).toFixed(1)} km`,
    `Velocity: ${Number(d.velocity ?? 0).toFixed(1)} km/h`,
    `Visibility: ${d.visibility}`,
    `Timestamp: ${d.timestamp ? new Date(Number(d.timestamp) * 1000).toISOString() : 'n/a'}`,
  ];
  if (typeof d.latitude === 'number' && typeof d.longitude === 'number') {
    lines.push(`Map: https://www.openstreetmap.org/?mlat=${d.latitude}&mlon=${d.longitude}#map=4/${d.latitude}/${d.longitude}`);
  }
  return lines.join('\n');
}
