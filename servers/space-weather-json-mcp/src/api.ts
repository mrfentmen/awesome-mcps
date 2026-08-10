const BASE = 'https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json';

export interface XraysArgs {
  limit?: number;
}

export async function xrays(args: XraysArgs = {}): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-space-weather-json-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`NOAA SWPC returned ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  if (!Array.isArray(rows) || !rows.length) return 'No solar x ray data available.';
  const limit = Math.max(1, Math.min(args.limit ?? 12, 50));
  const shown = rows.slice(-limit).reverse();
  return `Solar x ray flux (${shown.length} most recent):\n` +
    shown
      .map((r, i) => `${i + 1}. ${r.time_tag ?? 'no time'} | ${r.satellite ?? ''} | ${typeof r.flux === 'number' ? r.flux.toExponential(2) : r.flux ?? ''} W/m2`)
      .join('\n');
}
