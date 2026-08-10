const BASE = 'https://ssd-api.jpl.nasa.gov/fireball.api';

export interface RecentArgs {
  limit?: number;
}

export async function recent(args: RecentArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const res = await fetch(`${BASE}?limit=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-jpl-fireball-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`JPL returned ${res.status}`);
  const d = (await res.json()) as { count?: number; fields?: string[]; data?: Array<Array<string>> };
  const fields = d.fields ?? [];
  const rows = (d.data ?? []).slice(0, limit);
  if (!rows.length) return 'No fireballs returned.';
  const get = (r: string[], k: string) => r[fields.indexOf(k)] ?? '';
  return `Recent fireball impacts (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const energy = Number(get(r, 'energy')) > 0 ? ` | ${get(r, 'energy')} kt` : '';
        return `${i + 1}. ${get(r, 'date').replace('T', ' ')} | impact ${get(r, 'lat')},${get(r, 'lon')}${energy}${get(r, 'vel') ? ` | ${get(r, 'vel')} km/s` : ''}`;
      })
      .join('\n');
}
