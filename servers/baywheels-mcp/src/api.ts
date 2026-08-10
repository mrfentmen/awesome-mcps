const BASE = 'https://gbfs.baywheels.com/gbfs/en/station_information.json';

export interface StationsArgs {
  limit?: number;
}

export async function stations(args: StationsArgs = {}): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-baywheels-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Bay Wheels returned ${res.status}`);
  const data = (await res.json()) as {
    data?: { stations?: Array<Record<string, unknown>> };
  };
  const all = data.data?.stations ?? [];
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const shown = all.slice(0, limit);
  if (!shown.length) return 'No Bay Wheels stations available.';
  return `Bay Wheels stations (${all.length} total, ${shown.length} shown):\n` +
    shown
      .map((s, i) => `${i + 1}. ${s.name ?? 'unnamed'} | ${s.capacity ?? ''} docks | ${s.lat ?? ''}, ${s.lon ?? ''}`)
      .join('\n');
}
