const BASE = "https://api.carbonintensity.org.uk"
const UA = "mrfentmen-carbon-intensity-mcp/1.0 (https://github.com/mrfentmen)"
export class CarbonError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new CarbonError(`Carbon Intensity returned HTTP ${res.status}`)
  return (await res.json()) as T
}

function fmtIntensity(row: any): string {
  const from = row?.from ? new Date(row.from).toISOString().slice(11, 16) : "?"
  const actual = row?.intensity?.actual ?? row?.intensity?.forecast
  const index = row?.intensity?.index ?? ""
  return `${from}: ${actual != null ? `${Math.round(actual)} gCO2/kWh` : "n/a"} (${index})`
}

export async function intensity(_args?: unknown): Promise<string> {
  const d = await get<any>(`${BASE}/intensity`)
  const row = d?.data?.[0]
  if (!row) throw new CarbonError("No intensity data")
  const from = row?.from ? new Date(row.from).toISOString().replace("T", " ").slice(0, 16) : "?"
  const actual = row?.intensity?.actual ?? row?.intensity?.forecast
  return `UK grid carbon intensity at ${from}:\n  ${actual != null ? `${Math.round(actual)} gCO2/kWh` : "n/a"} (${row?.intensity?.index ?? ""})`
}

export async function forecast(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 24, 48)
  const from = new Date()
  const to = new Date(from.getTime() + 48 * 3600000)
  const f = from.toISOString().slice(0, 16) + "Z"
  const t = to.toISOString().slice(0, 16) + "Z"
  const d = await get<any>(`${BASE}/intensity/${f}/${t}`)
  const rows = (d?.data ?? []).slice(0, limit) as any[]
  if (!rows.length) throw new CarbonError("No forecast data")
  return `UK carbon intensity forecast (next ${rows.length} half hours):\n` + rows.map(fmtIntensity).join("\n")
}

export async function regional(_args?: unknown): Promise<string> {
  const d = await get<any>(`${BASE}/regional`)
  const regions = d?.data?.[0]?.regions ?? []
  if (!regions.length) throw new CarbonError("No regional data")
  const rows = regions
    .sort((a: any, b: any) => (a?.intensity?.forecast ?? 0) - (b?.intensity?.forecast ?? 0))
    .map((r: any, i: number) => `${i + 1}. ${r?.shortname ?? "n/a"}: ${r?.intensity?.forecast != null ? `${Math.round(r.intensity.forecast)} gCO2/kWh` : "n/a"} (${r?.intensity?.index ?? ""})`)
  return `UK regional carbon intensity (cleanest first):\n` + rows.join("\n")
}
