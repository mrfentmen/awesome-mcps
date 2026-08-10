const BASE = "https://overpass-api.de/api/interpreter"
const UA = "mrfentmen-overpass-mcp/1.0 (https://github.com/mrfentmen)"
export class OverpassError extends Error {}

export async function nodesInBox(args: { min_lat?: number; min_lon?: number; max_lat?: number; max_lon?: number; amenity?: string; limit?: number }): Promise<string> {
  const minLat = args.min_lat
  const minLon = args.min_lon
  const maxLat = args.max_lat
  const maxLon = args.max_lon
  if ([minLat, minLon, maxLat, maxLon].some((v) => v === undefined)) {
    throw new OverpassError("Provide a bounding box with min and max latitude and longitude")
  }
  if (minLat! > maxLat! || minLon! > maxLon!) throw new OverpassError("Min values must be less than max values")
  const amenity = (args.amenity ?? "cafe").trim().toLowerCase()
  if (!/^[a-z_]+$/.test(amenity)) throw new OverpassError("Amenity must be a simple type like cafe or school")
  const limit = Math.min(args.limit ?? 20, 50)
  const query = `[out:json][timeout:15];node(${minLat},${minLon},${maxLat},${maxLon})[amenity=${amenity}];out body ${limit};`
  let d: any = null
  let lastErr: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${BASE}?data=${encodeURIComponent(query)}`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
    if (res.status === 429 || res.status === 504) {
      lastErr = new OverpassError("Overpass is busy, wait and retry")
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)))
      continue
    }
    if (!res.ok) throw new OverpassError(`Overpass error ${res.status}`)
    d = (await res.json()) as any
    break
  }
  if (!d) throw lastErr ?? new OverpassError("Overpass request failed")
  const elements = d?.elements ?? []
  if (!elements.length) return `No ${amenity} found in that area`
  const names = elements.map((e: any, i: number) => {
    const name = e?.tags?.name ?? `unnamed ${amenity}`
    return `${i + 1}. ${name} (${e?.lat?.toFixed(4) ?? "?"}, ${e?.lon?.toFixed(4) ?? "?"})`
  })
  return `Found ${elements.length} ${amenity}(s):\n${names.join("\n")}`
}
