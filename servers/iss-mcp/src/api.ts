const UA = "mrfentmen-iss-mcp/1.0 (https://github.com/mrfentmen)"
export class IssError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new IssError(`ISS API error ${res.status}`)
  return (await res.json()) as T
}

export async function issNow(_args: Record<string, never>): Promise<string> {
  const d = await get<any>("https://api.wheretheiss.at/v1/satellites/25544")
  const when = new Date((d.timestamp ?? Date.now()) * 1000).toISOString()
  return `ISS position at ${when}\nLatitude: ${d.latitude?.toFixed(4)}\nLongitude: ${d.longitude?.toFixed(4)}\nAltitude: ${Math.round(d.altitude ?? 0)} km\nVelocity: ${Math.round(d.velocity ?? 0)} km/h\nVisibility: ${d.visibility ?? ""}\nFootprint: ${Math.round(d.footprint ?? 0)} km`
}

export async function issPasses(args: { lat?: number; lon?: number; days?: number }): Promise<string> {
  const lat = args.lat ?? 0
  const lon = args.lon ?? 0
  if (!lat && !lon) throw new IssError("Provide lat and lon")
  const days = Math.min(args.days ?? 3, 10)
  const d = await get<any>(`https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${Array.from({ length: days * 24 }, (_, i) => Math.floor(Date.now() / 1000) + i * 3600).join(",")}`)
  const rows = (d ?? []).slice(0, 20)
  const near = rows.filter((r: any) => {
    const dist = Math.hypot(Number(r.latitude) - lat, Number(r.longitude) - lon)
    return dist < 30
  })
  return `${rows.length} position samples over ${days} days\nClosest approach estimated ${near.length ? "near your location" : "not within 30 degrees"}\nFirst: ${rows[0]?.timestamp ? new Date(rows[0].timestamp * 1000).toISOString() : ""}\nLast: ${rows[rows.length - 1]?.timestamp ? new Date(rows[rows.length - 1].timestamp * 1000).toISOString() : ""}`
}
