const BASE = "https://api.weather.gov"
const UA = "mrfentmen-weather-alerts-mcp/1.0 (https://github.com/mrfentmen)"
export class AlertError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/geo+json" }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new AlertError(`NWS error ${res.status}`)
  return (await res.json()) as T
}

function fmt(f: any): string {
  const p = f.properties ?? {}
  return `${p.event ?? ""} | ${p.severity ?? ""} (${p.areaDesc ?? ""})\n  ${(p.headline ?? "").slice(0, 250)}\n  ${(p.description ?? "").replace(/\s+/g, " ").slice(0, 400)}`
}

export async function activeAlerts(args: { state?: string; limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 8, 20)
  const state = (args.state ?? "").trim().toUpperCase()
  const url = state ? `${BASE}/alerts/active?area=${state}` : `${BASE}/alerts/active`
  const d = await get<any>(url)
  const rows = (d.features ?? []).slice(0, limit)
  return `${rows.length} active alerts${state ? ` for ${state}` : ""}\n${rows.map(fmt).join("\n\n") || "None active"}`
}

export async function alertsForPoint(args: { lat?: number; lon?: number }): Promise<string> {
  const lat = args.lat ?? 0
  const lon = args.lon ?? 0
  if (!lat && !lon) throw new AlertError("Provide lat and lon")
  const d = await get<any>(`${BASE}/alerts/active?point=${lat},${lon}`)
  const rows = d.features ?? []
  return `${rows.length} active alerts near ${lat}, ${lon}\n${rows.slice(0, 8).map(fmt).join("\n\n") || "None active"}`
}
