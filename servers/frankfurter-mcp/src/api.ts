const BASE = 'https://api.frankfurter.app';

export interface LatestArgs {
  from?: string;
  to?: string;
}

export interface HistoryArgs {
  from: string;
  to: string;
  start: string;
  end: string;
}

export async function latest(args: LatestArgs): Promise<string> {
  const from = (args.from ?? 'USD').toUpperCase();
  const to = (args.to ?? '').toUpperCase();
  const url = `${BASE}/latest?from=${encodeURIComponent(from)}${to ? `&to=${encodeURIComponent(to)}` : ''}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-frankfurter-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Frankfurter returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const rates = (d.rates ?? {}) as Record<string, unknown>;
  if (!Object.keys(rates).length) return 'No rates returned.';
  return `Rates for ${String(d.base ?? from)} on ${String(d.date ?? '')}:\n` +
    Object.entries(rates).slice(0, 20).map(([k, v]) => `${k}: ${String(v)}`).join('\n');
}

export async function history(args: HistoryArgs): Promise<string> {
  const from = (args.from ?? '').toUpperCase();
  const to = (args.to ?? '').toUpperCase();
  const start = (args.start ?? '').trim();
  const end = (args.end ?? '').trim();
  if (!from || !to || !start || !end) return 'Provide from, to, start, and end.';
  const res = await fetch(`${BASE}/${start}..${end}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
    headers: { 'User-Agent': 'mrfentmen-frankfurter-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Frankfurter returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const rates = (d.rates ?? {}) as Record<string, Record<string, unknown>>;
  const dates = Object.keys(rates).sort();
  if (!dates.length) return 'No history returned.';
  const rows = dates.map((dt) => `${dt}: ${String(rates[dt][to] ?? 'n/a')}`);
  return `Rate history ${from} -> ${to} (${dates.length} days):\n` + rows.join('\n');
}
