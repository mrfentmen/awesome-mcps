const BASE = 'https://api.nasa.gov/neo/rest/v1/neo/browse';

export interface BrowseArgs {
  limit?: number;
}

export async function browse(args: BrowseArgs = {}): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const res = await fetch(`${BASE}?api_key=DEMO_KEY`, {
    headers: { 'User-Agent': 'mrfentmen-nasa-asteroids-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`NASA NeoWs returned ${res.status}`);
  const data = (await res.json()) as {
    near_earth_objects?: Array<Record<string, unknown>>;
  };
  const rows = data.near_earth_objects ?? [];
  if (!rows.length) return 'No near earth objects returned.';
  const shown = rows.slice(0, limit);
  return `Near Earth Objects (${rows.length} loaded, ${shown.length} shown):\n` +
    shown
      .map((a, i) => {
        const size = (a.estimated_diameter ?? {}) as Record<string, unknown>;
        const km = (size.kilometers ?? {}) as Record<string, unknown> | undefined;
        const hazard = a.is_potentially_hazardous_asteroid ? 'hazardous' : 'safe';
        const name = a.name ?? 'unnamed';
        const diameter = km?.estimated_diameter_max ? `${Number(km.estimated_diameter_max).toFixed(1)} km` : '';
        return `${i + 1}. ${name} | ${hazard}${diameter ? ` | ${diameter} max` : ''}`;
      })
      .join('\n');
}
