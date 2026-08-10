const BASE = 'https://ll.thespacedevs.com/2.2.0/astronaut/';

export interface ListArgs {
  limit?: number;
}

export async function list(args: ListArgs = {}): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const res = await fetch(`${BASE}?limit=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-astronauts-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Launch Library returned ${res.status}`);
  const data = (await res.json()) as {
    count?: number;
    results?: Array<Record<string, unknown>>;
  };
  const rows = data.results ?? [];
  if (!rows.length) return 'No astronaut profiles available.';
  return `Astronauts (${data.count ?? rows.length} total, ${rows.length} shown):\n` +
    rows
      .map((a, i) => {
        const name = a.name ?? 'unknown';
        const status = a.status ? String((a.status as Record<string, unknown>).name ?? '') : '';
        const flights = typeof a.flights_count === 'number' ? ` | ${a.flights_count} flights` : '';
        const agency = a.agency ? ` | ${(a.agency as Record<string, unknown>).name ?? ''}` : '';
        return `${i + 1}. ${name}${agency}${flights}${status ? ` | ${status}` : ''}`;
      })
      .join('\n');
}
