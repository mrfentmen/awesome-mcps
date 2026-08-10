const UA = "mrfentmen-earthquake-mcp/1.0 (https://github.com/mrfentmen)"
const FEEDS: Record<string, string> = {
  "1": "all_day",
  "7": "all_week",
  "30": "all_month",
}

export class EarthquakeError extends Error {}

async function get(feed: string, minMag: number, limit: number): Promise<any[]> {
  const res = await fetch(`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${feed}.geojson`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new EarthquakeError(`USGS returned HTTP ${res.status}`)
  const d = (await res.json()) as { features: any[] }
  const out: any[] = []
  for (const f of d.features ?? []) {
    const p = f.properties ?? {}
    const mag = p.mag ?? 0
    if (mag < minMag) continue
    out.push({ mag, place: p.place, time: p.time, url: p.url, depth: f.geometry?.coordinates?.[2] })
    if (out.length >= limit) break
  }
  return out
}

export async function recent(args: { days?: number; min_mag?: number; limit?: number }): Promise<string> {
  const days = String(args.days ?? 1)
  const feed = FEEDS[days]
  if (!feed) throw new EarthquakeError("days must be 1, 7, or 30")
  const limit = Math.min(args.limit ?? 10, 50)
  const quakes = await get(feed, args.min_mag ?? 2.5, limit)
  if (!quakes.length) return `No earthquakes above magnitude ${args.min_mag ?? 2.5} in the last ${days} day(s)`
  return quakes.map((q, i) => {
    const d = new Date(q.time).toISOString().slice(0, 16).replace("T", " ")
    return `${i + 1}. M${q.mag.toFixed(1)} | ${q.place} | ${d} | depth ${q.depth ?? "n/a"} km`
  }).join("\n")
}

export async function byPlace(args: { place?: string; limit?: number }): Promise<string> {
  const place = (args.place ?? "").trim().toLowerCase()
  if (!place) throw new EarthquakeError("Provide a place keyword")
  const limit = Math.min(args.limit ?? 10, 50)
  const quakes = await get("all_week", 0, 500)
  const hits = quakes.filter((q) => String(q.place ?? "").toLowerCase().includes(place)).slice(0, limit)
  if (!hits.length) return `No earthquakes found for "${args.place}" this week`
  return hits.map((q, i) => {
    const d = new Date(q.time).toISOString().slice(0, 16).replace("T", " ")
    return `${i + 1}. M${q.mag.toFixed(1)} | ${q.place} | ${d}`
  }).join("\n")
}
