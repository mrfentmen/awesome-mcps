const BASE = 'https://www.7timer.info/bin/api.pl';

export interface ForecastArgs {
  lat: number;
  lon: number;
}

export async function forecast(args: ForecastArgs): Promise<string> {
  const lat = Number(args.lat);
  const lon = Number(args.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return 'Provide valid latitude and longitude.';
  const params = new URLSearchParams({ lon: String(lon), lat: String(lat), product: 'civil', output: 'json' });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-7timer-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`7Timer returned ${res.status}`);
  const raw = (await res.json()) as { dataseries?: Array<Record<string, unknown>>; init?: string };
  const rows = raw.dataseries ?? [];
  if (!rows.length) return 'No forecast data returned.';
  const icons: Record<string, string> = {
    clear: 'clear', pcloudy: 'partly cloudy', cloudy: 'cloudy', rain: 'rain', snow: 'snow', tstorm: 'thunderstorm', humid: 'humid', fog: 'fog', windy: 'windy',
  };
  return `7Timer forecast for ${lat}, ${lon} (init ${String(raw.init ?? '')}):\n` +
    rows.slice(0, 12).map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      const icon = icons[s('icon')] ?? s('icon');
      return `+${s('timepoint')}h | ${icon} | ${s('temp2m')}C | precip ${s('prec_type')} | ${s('rh2m')}% RH`;
    }).join('\n');
}
