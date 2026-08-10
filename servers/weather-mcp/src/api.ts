const UA = "mrfentmen-weather-mcp/1.0 (https://github.com/mrfentmen)"
export class WeatherError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new WeatherError(`API error ${res.status}`)
  return (await res.json()) as T
}

export async function forecast(args: { lat?: number; lon?: number }): Promise<string> {
  const lat = args.lat ?? 0
  const lon = args.lon ?? 0
  if (!lat && !lon) throw new WeatherError("Provide lat and lon")
  const points = await get<any>(`https://api.weather.gov/points/${lat},${lon}`)
  const fc = await get<any>(points.properties?.forecast)
  const periods = (fc.properties?.periods ?? []).slice(0, 12)
  return `Forecast for ${points.properties?.relativeLocation?.properties?.city ?? ""}, ${points.properties?.relativeLocation?.properties?.state ?? ""}\n${periods.map((p: any) =>
    `${p.name}: ${p.temperature}${p.temperatureUnit} ${p.shortForecast}\n  ${p.detailedForecast.slice(0, 140)}`
  ).join("\n")}`
}

export async function earthquakes(args: { days?: number }): Promise<string> {
  const days = args.days === 7 ? "all_week" : "all_day"
  const d = await get<any>(`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${days}.geojson`)
  const rows = (d.features ?? []).slice(0, 20)
  return `Recent earthquakes (${days === "all_week" ? "week" : "day"}): ${d.metadata?.count ?? 0} total\n${rows.map((f: any) => {
    const p = f.properties ?? {}
    return `${p.mag ?? "?"}M | ${p.place ?? ""} | ${new Date(p.time ?? 0).toISOString().slice(0, 16)}`
  }).join("\n")}`
}

export async function femaDisasters(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 25)
  const d = await get<any>(
    `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$top=${limit}&$orderby=declarationDate%20desc`
  )
  const rows = (d.DisasterDeclarationsSummaries ?? [])
    .slice()
    .sort((a: any, b: any) => String(b.declarationDate ?? "").localeCompare(String(a.declarationDate ?? "")))
    .slice(0, limit)
  return rows.map((r: any) =>
    `${r.declarationDate?.slice(0, 10) ?? ""} | ${r.incidentType ?? ""} | ${r.state ?? ""}\n  ${r.declarationTitle ?? r.incidentTitle ?? ""} | ${r.femaDeclarationString ?? ""}`
  ).join("\n\n") || "No disasters found"
}
