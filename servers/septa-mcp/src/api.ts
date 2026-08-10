const BASE = 'https://www3.septa.org/hackathon';

export interface NextArgs {
  from: string;
  to: string;
  count?: number;
}

export interface RouteArgs {
  route: string;
}

export async function next(args: NextArgs): Promise<string> {
  const from = (args.from ?? '').trim();
  const to = (args.to ?? '').trim();
  if (!from || !to) return 'Provide origin and destination stations.';
  const count = Math.max(1, Math.min(args.count ?? 10, 50));
  const res = await fetch(`${BASE}/NextToArrive/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${count}`, {
    headers: { 'User-Agent': 'mrfentmen-septa-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`SEPTA returned ${res.status}`);
  const d = (await res.json()) as Array<Record<string, unknown>>;
  if (!d.length) return `No arrivals from ${from} to ${to}.`;
  return `Next arrivals ${from} -> ${to}:\n` +
    d.map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      return `${i + 1}. ${s('orig_train')} departs ${s('orig_departure_time')}${s('orig_delay') !== '0' ? ` (delay ${s('orig_delay')}m)` : ''} on ${s('orig_line')}`;
    }).join('\n');
}

export async function stops(args: RouteArgs): Promise<string> {
  const route = (args.route ?? '').trim();
  if (!route) return 'Provide a route id.';
  const res = await fetch(`${BASE}/Stops/${encodeURIComponent(route)}`, {
    headers: { 'User-Agent': 'mrfentmen-septa-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`SEPTA returned ${res.status}`);
  const d = await res.json();
  const rows = Array.isArray(d) ? (d as Array<Record<string, unknown>>) : [];
  if (!rows.length) return `No stops for route ${route}.`;
  return `Stops on route ${route} (${rows.length}):\n` +
    rows.slice(0, 20).map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      return `${i + 1}. ${s('stop_name')}`;
    }).join('\n');
}
