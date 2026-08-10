const BASE = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';

export interface ForecastArgs {
  lat: number;
  lon: number;
}

interface ForecastTime {
  time?: string;
  data?: {
    instant?: { details?: Record<string, number> };
    next_1_hours?: { details?: Record<string, number> };
  };
}

export async function forecast(args: ForecastArgs): Promise<string> {
  if (typeof args.lat !== 'number' || typeof args.lon !== 'number') {
    return 'Provide numeric latitude and longitude.';
  }
  const url = `${BASE}?lat=${args.lat}&lon=${args.lon}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'mrfentmen-met-no-mcp/1.0 (https://github.com/mrfentmen)',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Met.no returned ${res.status}`);
  const data = (await res.json()) as { properties?: { timeseries?: ForecastTime[] } };
  const series = (data.properties?.timeseries ?? []).slice(0, 12);
  if (!series.length) throw new Error('Met.no returned no forecast');
  return `Weather forecast for ${args.lat}, ${args.lon} (next ${series.length} periods):\n` +
    series
      .map((t, i) => {
        const d = t.data?.instant?.details ?? {};
        const next = t.data?.next_1_hours?.details ?? {};
        const temp = d.air_temperature;
        const parts = [`${(t.time ?? '').replace('T', ' ').slice(5, 16)}`];
        if (typeof temp === 'number') parts.push(`${temp.toFixed(1)}C`);
        if (typeof next.precipitation_amount === 'number') parts.push(`rain ${next.precipitation_amount.toFixed(1)}mm`);
        if (typeof d.wind_speed === 'number') parts.push(`wind ${d.wind_speed.toFixed(1)}m/s`);
        return `${i + 1}. ${parts.join(' | ')}`;
      })
      .join('\n');
}
