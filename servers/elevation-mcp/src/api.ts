const BASE = "https://api.open-meteo.com/v1/elevation"
const UA = "mrfentmen-elevation-mcp/1.0 (https://github.com/mrfentmen)"
export class ElevationError extends Error {}

export async function elevation(args: { lat?: number; lon?: number }): Promise<string> {
  const lat = args.lat
  const lon = args.lon
  if (lat === undefined || lon === undefined || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new ElevationError("Provide valid latitude and longitude")
  }
  const res = await fetch(`${BASE}?latitude=${lat}&longitude=${lon}`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new ElevationError("Open-Meteo rate limit hit, wait and retry")
  if (!res.ok) throw new ElevationError(`Open-Meteo error ${res.status}`)
  const d = (await res.json()) as any
  const el = d?.elevation?.[0]
  if (el === undefined) throw new ElevationError("No elevation returned")
  return `Elevation at ${lat}, ${lon}: ${el} meters (${(el * 3.28084).toFixed(0)} feet)`
}
