
export interface m0_AreaArgs {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
  limit?: number;
}

const m0 = (() => {
const BASE = 'https://opensky-network.org/api/states/all';


async function area(args: m0_AreaArgs): Promise<string> {
  const minLat = Number(args.minLat);
  const minLon = Number(args.minLon);
  const maxLat = Number(args.maxLat);
  const maxLon = Number(args.maxLon);
  if ([minLat, minLon, maxLat, maxLon].some((n) => !Number.isFinite(n))) return 'Provide a valid bounding box.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const params = new URLSearchParams({
    lamin: String(Math.min(minLat, maxLat)),
    lomin: String(Math.min(minLon, maxLon)),
    lamax: String(Math.max(minLat, maxLat)),
    lomax: String(Math.max(minLon, maxLon)),
  });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-opensky-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`OpenSky returned ${res.status}`);
  const d = (await res.json()) as { states?: Array<Array<unknown>> };
  const states = d.states ?? [];
  if (!states.length) return 'No flights in that area.';
  const rows = states.slice(0, limit).map((st) => {
    const callsign = String(st[1] ?? '').trim() || 'unknown';
    const alt = Number(st[7] ?? 0);
    const vel = Number(st[9] ?? 0);
    const country = String(st[2] ?? '');
    return `${callsign} | ${country} | ${alt ? (alt * 0.3048).toFixed(0) + ' m' : 'ground'} | ${vel ? Math.round(vel * 1.852) + ' km/h' : ''}`;
  });
  return `Flights in area (${rows.length} shown of ${states.length}):\n` + rows.join('\n');
}

return { area };
})();

const m1 = (() => {
const BASE = "https://opensky-network.org/api"
const UA = "mrfentmen-flights-mcp/1.0 (https://github.com/mrfentmen)"
class FlightsError extends Error {}

function fmtState(s: any): string {
  const [icao, callsign, origin, , , lon, lat, alt, onGround, vel, heading] = s
  return `${callsign?.trim() || icao} | ${origin ?? "?"} | ${lat?.toFixed(2) ?? "?"}, ${lon?.toFixed(2) ?? "?"} | alt ${Math.round(alt ?? 0)} m | ${onGround ? "on ground" : `airborne ${Math.round(vel ?? 0)} m/s`}${heading ? ` | heading ${Math.round(heading)}` : ""}`
}

async function flightsNear(args: { lat?: number; lon?: number; radius_km?: number }): Promise<string> {
  const lat = args.lat ?? 0
  const lon = args.lon ?? 0
  if (!lat && !lon) throw new FlightsError("Provide lat and lon")
  const km = args.radius_km ?? 100
  const dLat = km / 111
  const dLon = km / (111 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)))
  const res = await fetch(
    `${BASE}/states/all?lamin=${lat - dLat}&lomin=${lon - dLon}&lamax=${lat + dLat}&lomax=${lon + dLon}`,
    { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) }
  )
  if (res.status === 429) throw new FlightsError("OpenSky rate limit hit, wait a few seconds")
  if (!res.ok) throw new FlightsError(`OpenSky error ${res.status}`)
  const d = await res.json()
  const states = (d.states ?? []).slice(0, 30)
  return `${states.length} aircraft near ${lat}, ${lon}\n${states.map(fmtState).join("\n") || "None found"}`
}

async function flightsInBox(args: {
  min_lat?: number; min_lon?: number; max_lat?: number; max_lon?: number; limit?: number
}): Promise<string> {
  const res = await fetch(
    `${BASE}/states/all?lamin=${args.min_lat ?? 0}&lomin=${args.min_lon ?? 0}&lamax=${args.max_lat ?? 0}&lomax=${args.max_lon ?? 0}`,
    { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) }
  )
  if (res.status === 429) throw new FlightsError("OpenSky rate limit hit, wait a few seconds")
  if (!res.ok) throw new FlightsError(`OpenSky error ${res.status}`)
  const d = await res.json()
  const limit = Math.min(args.limit ?? 25, 50)
  const states = (d.states ?? []).slice(0, limit)
  return `${states.length} aircraft in the box\n${states.map(fmtState).join("\n") || "None found"}`
}

return { FlightsError, flightsInBox, flightsNear };
})();

export const FlightsError = m1.FlightsError;
export const area = m0.area;
export const flightsInBox = m1.flightsInBox;
export const flightsNear = m1.flightsNear;
export const m0_area = m0.area;
export const m1_flightsInBox = m1.flightsInBox;
export const m1_FlightsError = m1.FlightsError;
export const m1_flightsNear = m1.flightsNear;
