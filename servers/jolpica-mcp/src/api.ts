const BASE = 'https://api.jolpi.ca/ergast/f1';

export interface SeasonArgs {
  year?: number;
}

export async function current(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/current.json`, {
    headers: { 'User-Agent': 'mrfentmen-jolpica-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Jolpica returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const mr = (d.MRData ?? {}) as Record<string, unknown>;
  const raceTable = (mr.RaceTable ?? {}) as Record<string, unknown>;
  const races = (raceTable.Races ?? []) as Array<Record<string, unknown>>;
  return `F1 ${String(raceTable.season ?? 'current')} season (${races.length} races):\n` +
    races.slice(0, 10).map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      const c = (r.Circuit ?? {}) as Record<string, unknown>;
      return `${i + 1}. ${s('round')}. ${s('raceName')} | ${String(c.circuitName ?? '')} | ${s('date')}`;
    }).join('\n');
}

export async function races(args: SeasonArgs): Promise<string> {
  const year = args.year ?? 'current';
  const res = await fetch(`${BASE}/${year}.json`, {
    headers: { 'User-Agent': 'mrfentmen-jolpica-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Jolpica returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const mr = (d.MRData ?? {}) as Record<string, unknown>;
  const rt = (mr.RaceTable ?? {}) as Record<string, unknown>;
  const races = (rt.Races ?? []) as Array<Record<string, unknown>>;
  return `F1 ${String(rt.season ?? year)} race calendar:\n` +
    races.map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      const c = (r.Circuit ?? {}) as Record<string, unknown>;
      return `${i + 1}. ${s('round')}. ${s('raceName')} | ${String(c.circuitName ?? '')} | ${s('date')}`;
    }).join('\n');
}

export async function drivers(args: SeasonArgs): Promise<string> {
  const year = args.year ?? 'current';
  const res = await fetch(`${BASE}/${year}/drivers.json`, {
    headers: { 'User-Agent': 'mrfentmen-jolpica-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Jolpica returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const mr = (d.MRData ?? {}) as Record<string, unknown>;
  const dt = (mr.DriverTable ?? {}) as Record<string, unknown>;
  const drivers = (dt.Drivers ?? []) as Array<Record<string, unknown>>;
  return `F1 ${String(dt.season ?? year)} drivers (${drivers.length}):\n` +
    drivers.map((dr, i) => {
      const s = (k: string) => (dr[k] != null ? String(dr[k]) : '');
      return `${i + 1}. ${s('code')} ${s('givenName')} ${s('familyName')} (${s('nationality')})`;
    }).join('\n');
}
