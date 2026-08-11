const UA = 'mrfentmen-brightsky-mcp/1.0';

export interface WeatherArgs {
  lat: number;
  lon: number;
  date?: string;
}

export async function weather(args: WeatherArgs): Promise<string> {
  const lat = Number(args.lat);
  const lon = Number(args.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return 'Provide valid coordinates.';
  const date = (args?.date ?? '').trim();
  const url = date
    ? `https://api.brightsky.dev/weather?lat=${lat}&lon=${lon}&date=${encodeURIComponent(date)}`
    : `https://api.brightsky.dev/weather?lat=${lat}&lon=${lon}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Bright Sky returned ${res.status}`);
  const d = (await res.json()) as { weather?: Array<{ timestamp?: string; temperature?: number; precipitation?: number; wind_speed?: number; condition?: string; icon?: string }> };
  const w = d.weather ?? [];
  if (!w.length) return 'No weather data returned.';
  const rows = w.slice(0, 10).map((x, i) =>
    `${i + 1}. ${x.timestamp ?? '?'} | ${x.temperature != null ? x.temperature + 'C' : '?'} | ${x.condition ?? '?'} | wind ${x.wind_speed ?? '?'} km/h | rain ${x.precipitation ?? '?'} mm`
  );
  return `Bright Sky weather (${date || 'now'}):\n${rows.join('\n')}`;
}
