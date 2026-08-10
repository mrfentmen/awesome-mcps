const BASE = 'https://wttr.in';

export interface CurrentArgs {
  location: string;
}

export async function current(args: CurrentArgs): Promise<string> {
  const loc = (args.location ?? '').trim();
  if (!loc) return 'Provide a city name or coordinates.';
  const params = new URLSearchParams({ format: 'j1' });
  const res = await fetch(`${BASE}/${encodeURIComponent(loc)}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-wttr-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`wttr.in returned ${res.status}`);
  const d = (await res.json()) as {
    nearest_area?: Array<{ areaName?: Array<{ value?: string }>; country?: Array<{ value?: string }> }>;
    current_condition?: Array<{ temp_C?: string; weatherDesc?: Array<{ value?: string }>; humidity?: string; windspeedKmph?: string; FeelsLikeC?: string }>;
  };
  const area = d.nearest_area?.[0];
  const cond = d.current_condition?.[0];
  if (!cond) return 'No weather data returned.';
  const name = area?.areaName?.[0]?.value ?? loc;
  const country = area?.country?.[0]?.value ?? '';
  return [
    `Weather for ${name}${country ? `, ${country}` : ''}:`,
    `${cond.weatherDesc?.[0]?.value ?? 'Unknown'}, ${cond.temp_C ?? '?'} C (feels ${cond.FeelsLikeC ?? '?'} C)`,
    `Humidity: ${cond.humidity ?? '?'}% | Wind: ${cond.windspeedKmph ?? '?'} km/h`,
  ].filter(Boolean).join('\n');
}
