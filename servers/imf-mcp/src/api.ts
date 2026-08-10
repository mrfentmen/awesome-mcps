const BASE = 'https://www.imf.org/external/datamapper/api/v1';
const UA = 'mrfentmen-imf-mcp/1.0';

export interface IndicatorArgs {
  indicator: string;
  country?: string;
  limit?: number;
}

export async function indicator(args: IndicatorArgs): Promise<string> {
  const indicator = (args.indicator ?? '').trim().toUpperCase();
  if (!indicator) return 'Provide an indicator like NGDPD.';
  const country = (args?.country ?? '').trim().toUpperCase();
  const limit = Math.min(Math.max(Number(args?.limit ?? 10) || 10, 1), 30);
  const res = await fetch(`${BASE}/${encodeURIComponent(indicator)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`IMF returned ${res.status}`);
  const d = (await res.json()) as { values?: Record<string, Record<string, Record<string, number>>> };
  const values = d.values ?? {};
  const series = values[indicator] ?? {};
  const keys = country ? [country] : Object.keys(series).slice(0, 5);
  if (!keys.length) return `No IMF data for ${indicator}.`;
  const rows: string[] = [];
  for (const code of keys) {
    const years = series[code] ?? {};
    const yearKeys = Object.keys(years).sort().slice(-limit);
    if (!yearKeys.length) continue;
    rows.push(`${code}: ${yearKeys.map((y) => `${y}=${years[y]}`).join(', ')}`);
  }
  if (!rows.length) return `No IMF data for ${indicator}${country ? ` / ${country}` : ''}.`;
  return `IMF indicator ${indicator}${country ? ` for ${country}` : ''}:\n${rows.join('\n')}`;
}
