const BASE = "https://aviationweather.gov/api/data"
const UA = "mrfentmen-aviation-weather-mcp/1.0 (https://github.com/mrfentmen)"
export class AvwxError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new AvwxError(`Aviation Weather returned HTTP ${res.status}`)
  return (await res.json()) as T
}

function cleanStations(s: string): string {
  return s
    .split(",")
    .map((x) => x.trim().toUpperCase())
    .filter((x) => /^[A-Z]{4}$/.test(x))
    .join(",")
}

export async function metar(args: { stations?: string }): Promise<string> {
  const stations = cleanStations(args.stations ?? "")
  if (!stations) throw new AvwxError("Provide ICAO codes like KJFK,KLAX")
  const d = await get<any[]>(`${BASE}/metar?ids=${encodeURIComponent(stations)}&format=json`)
  const list = (d ?? []) as any[]
  if (!list.length) return `No METAR data for ${stations}`
  return `METAR reports:\n` + list.map((m: any) => {
    const time = m?.obsTime ? new Date(m.obsTime).toISOString().replace("T", " ").slice(0, 16) : ""
    const wind = m?.wdir != null ? `${m.wspd ?? 0} kt from ${m.wdir} deg` : ""
    return `${m?.icaoId ?? "n/a"} ${time}\n  ${m?.rawOb ?? "no raw report"}\n  ${wind}${m?.temp ? ` | temp ${m.temp} C` : ""}${m?.dewp != null ? ` | dew ${m.dewp} C` : ""}`
  }).join("\n")
}

export async function taf(args: { stations?: string }): Promise<string> {
  const stations = cleanStations(args.stations ?? "")
  if (!stations) throw new AvwxError("Provide ICAO codes like KJFK,KLAX")
  const d = await get<any[]>(`${BASE}/taf?ids=${encodeURIComponent(stations)}&format=json`)
  const list = (d ?? []) as any[]
  if (!list.length) return `No TAF data for ${stations}`
  return `TAF forecasts:\n` + list.map((t: any) => {
    const issued = t?.issueTime ? new Date(t.issueTime).toISOString().replace("T", " ").slice(0, 16) : ""
    return `${t?.icaoId ?? "n/a"} issued ${issued}\n  ${t?.rawTAF ?? "no raw forecast"}`
  }).join("\n")
}
