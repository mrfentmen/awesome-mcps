const BASE = "https://nominatim.openstreetmap.org"
const UA = "mrfentmen-geocoding-mcp/1.0 (https://github.com/mrfentmen)"
export class GeocodeError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new GeocodeError("Nominatim rate limit hit, wait a second and retry")
  if (!res.ok) throw new GeocodeError(`Nominatim error ${res.status}`)
  return (await res.json()) as T
}

export async function geocode(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new GeocodeError("Provide a place name or address")
  const limit = Math.min(args.limit ?? 5, 10)
  const d = await get<any[]>(`${BASE}/search?q=${encodeURIComponent(q)}&format=json&limit=${limit}&addressdetails=0`)
  if (!d.length) return "No results found"
  return d.map((r: any, i: number) => {
    const city = r?.address?.city || r?.address?.town || r?.address?.village || ""
    return `${i + 1}. ${r?.display_name ?? "n/a"}\n   ${r?.lat ?? "?"}, ${r?.lon ?? "?"}${city ? ` | ${city}` : ""}`
  }).join("\n\n")
}

export async function reverse(args: { lat?: number; lon?: number }): Promise<string> {
  const lat = args.lat
  const lon = args.lon
  if (lat === undefined || lon === undefined || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new GeocodeError("Provide valid latitude and longitude")
  }
  const d = await get<any>(`${BASE}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`)
  return `${d?.display_name ?? "No address found"}\n\nLatitude: ${d?.lat ?? lat} | Longitude: ${d?.lon ?? lon}\nType: ${d?.type ?? "n/a"} (${d?.category ?? ""})`
}
