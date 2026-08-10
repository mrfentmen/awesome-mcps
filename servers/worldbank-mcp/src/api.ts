const BASE = "https://api.worldbank.org/v2"
const UA = "mrfentmen-worldbank-mcp/1.0 (https://github.com/mrfentmen)"
export class WorldbankError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new WorldbankError(`World Bank returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function indicator(args: { country?: string; indicatorCode?: string; limit?: number }): Promise<string> {
  const country = (args.country ?? "USA").trim().toUpperCase()
  const code = (args.indicatorCode ?? "").trim()
  if (!code) throw new WorldbankError("Provide an indicator code like NY.GDP.MKTP.CD")
  const limit = Math.min(args.limit ?? 12, 50)
  const d = await get<any[]>(`${BASE}/country/${encodeURIComponent(country)}/indicator/${encodeURIComponent(code)}?format=json&per_page=${limit}`)
  const rows = (d?.[1] ?? []) as any[]
  if (!rows.length) return `No data for ${code} in ${country}`
  const lines = rows.map((r: any) => `${r?.date ?? "?"}: ${r?.value != null ? Number(r.value).toLocaleString() : "n/a"}`)
  return `Indicator ${code} for ${country} (newest first):\n` + lines.join("\n")
}

export async function countries(_args?: unknown): Promise<string> {
  const d = await get<any[]>(`${BASE}/country?format=json&per_page=300`)
  const rows = (d?.[1] ?? []) as any[]
  if (!rows.length) return "No countries found"
  const list = rows.filter((r: any) => r?.region?.value && r.region.value !== "Aggregates")
  return `World Bank countries (${list.length}):\n` + list.map((c: any, i: number) => {
    const region = c?.region?.value ?? ""
    const income = c?.incomeLevel?.value ?? ""
    return `${i + 1}. ${c?.name ?? "n/a"} (${c?.id ?? ""}) | ${region} | ${income}`
  }).join("\n")
}
