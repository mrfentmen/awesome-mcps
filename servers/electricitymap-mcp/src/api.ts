const UA = 'mrfentmen-electricitymap-mcp/1.0';

export interface ZonesArgs {
  limit?: number;
}

export async function zones(args: ZonesArgs): Promise<string> {
  const limit = Math.min(Math.max(Number(args?.limit ?? 10) || 10, 1), 50);
  const res = await fetch('https://api.electricitymap.org/v3/zones', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Electricity Map returned ${res.status}`);
  const d = (await res.json()) as Record<string, { zoneName?: string; zoneKey?: string; countryCode?: string }>;
  const keys = Object.keys(d ?? {});
  if (!keys.length) return 'No zones returned.';
  const header = `Electricity Map zones (${keys.length}, showing ${Math.min(limit, keys.length)}):`;
  return header + '\n' + keys.slice(0, limit).map((k, i) => {
    const z = d[k];
    return `${i + 1}. ${k} | ${z?.zoneName ?? '?'} | country: ${z?.countryCode ?? '?'}`;
  }).join('\n');
}
