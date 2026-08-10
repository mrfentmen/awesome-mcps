const UA = "mrfentmen-aurora-forecast-mcp/1.0 (https://github.com/mrfentmen)"
const URL = "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json"

export class AuroraError extends Error {}

async function get(): Promise<any> {
  const res = await fetch(URL, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new AuroraError(`NOAA SWPC returned HTTP ${res.status}`)
  return res.json()
}

export async function latest(_args?: unknown): Promise<string> {
  const d = await get()
  const obs = d["Observation Time"] ?? "n/a"
  const fc = d["Forecast Time"] ?? "n/a"
  const coords = Array.isArray(d.coordinates) ? d.coordinates.length : 0
  return [
    `Observation time: ${obs}`,
    `Forecast time: ${fc}`,
    `Map points: ${coords} (longitude, latitude, aurora intensity)`,
  ].join("\n")
}

export async function map(_args?: unknown): Promise<string> {
  const d = await get()
  const coords = Array.isArray(d.coordinates) ? (d.coordinates as number[][]) : []
  if (!coords.length) return "No aurora map data available right now"
  let max = -Infinity
  for (const row of coords) {
    if (row && typeof row[2] === "number" && row[2] > max) max = row[2]
  }
  const strong = coords.filter((row) => row && typeof row[2] === "number" && row[2] > 1).length
  return [
    `Aurora map generated at ${d["Forecast Time"] ?? "n/a"}`,
    `Peak intensity: ${max === -Infinity ? "n/a" : max.toFixed(2)}`,
    `Points with strong aurora (intensity above 1): ${strong}`,
    `Total map points: ${coords.length}`,
  ].join("\n")
}
