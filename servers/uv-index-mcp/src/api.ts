const BASE = "https://api.open-meteo.com/v1/forecast"
const UA = "mrfentmen-uv-index-mcp/1.0 (https://github.com/mrfentmen)"
export class UvError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new UvError("Open-Meteo rate limit hit, wait and retry")
  if (!res.ok) throw new UvError(`Open-Meteo error ${res.status}`)
  return (await res.json()) as T
}

function label(uv: number): string {
  if (uv < 3) return "Low"
  if (uv < 6) return "Moderate"
  if (uv < 8) return "High"
  if (uv < 11) return "Very high"
  return "Extreme"
}

export async function uvForecast(args: { lat?: number; lon?: number; days?: number }): Promise<string> {
  const lat = args.lat
  const lon = args.lon
  if (lat === undefined || lon === undefined || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new UvError("Provide valid latitude and longitude")
  }
  const days = Math.min(Math.max(args.days ?? 3, 1), 16)
  const d = await get<any>(`${BASE}?latitude=${lat}&longitude=${lon}&daily=uv_index_max&timezone=auto&forecast_days=${days}`)
  const dates = d?.daily?.time ?? []
  const uvs = d?.daily?.uv_index_max ?? []
  if (!dates.length) return "No UV data returned"
  return dates.map((date: string, i: number) => `${date}: UV ${uvs[i]} (${label(uvs[i])})`).join("\n")
}
