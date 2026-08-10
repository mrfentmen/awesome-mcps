const BASE = "https://opensky-network.org/api"
const UA = "mrfentmen-flights-mcp/1.0 (https://github.com/mrfentmen)"
export class FlightsError extends Error {}

function fmtState(s: any): string {
  const [icao, callsign, origin, , , lon, lat, alt, onGround, vel, heading] = s
  return `${callsign?.trim() || icao} | ${origin ?? "?"} | ${lat?.toFixed(2) ?? "?"}, ${lon?.toFixed(2) ?? "?"} | alt ${Math.round(alt ?? 0)} m | ${onGround ? "on ground" : `airborne ${Math.round(vel ?? 0)} m/s`}${heading ? ` | heading ${Math.round(heading)}` : ""}`
}

export async function flightsNear(args: { lat?: number; lon?: number; radius_km?: number }): Promise<string> {
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

export async function flightsInBox(args: {
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
