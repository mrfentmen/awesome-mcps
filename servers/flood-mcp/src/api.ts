const BASE = 'https://flood-api.open-meteo.com/v1/flood';
const UA = 'mrfentmen-flood-mcp/1.0';

export interface ForecastArgs {
  lat: number;
  lng: number;
  limit?: number;
}

export async function forecast(args: ForecastArgs): Promise<string> {
  const lat = Number(args.lat);
  const lng = Number(args.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 'Provide valid coordinates.';
  const limit = Math.min(Math.max(Number(args.limit ?? 7) || 7, 1), 30);
  const res = await fetch(`${BASE}?latitude=${lat}&longitude=${lng}&daily=river_discharge`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Open-Meteo Flood returned ${res.status}`);
  const d = (await res.json()) as { latitude?: number; longitude?: number; daily?: { time?: string[]; river_discharge?: (number | null)[] } };
  const daily = d.daily ?? {};
  const times = daily.time ?? [];
  const discharge = daily.river_discharge ?? [];
  if (!times.length) return `No flood data at (${lat}, ${lng}).`;
  return `Open-Meteo flood forecast at (${d.latitude ?? lat}, ${d.longitude ?? lng}) next ${Math.min(limit, times.length)} days:\n` +
    times.slice(0, limit).map((t, i) => `${i + 1}. ${t}: ${discharge[i] != null ? `${discharge[i]} m3/s` : 'n/a'}`).join('\n');
}
