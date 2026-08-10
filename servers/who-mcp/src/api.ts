const BASE = "https://ghoapi.azureedge.net/api"
const UA = "mrfentmen-who-mcp/1.0 (https://github.com/mrfentmen)"
export class WhoError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new WhoError(`WHO GHO returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function indicator(args: { code?: string; limit?: number }): Promise<string> {
  const code = (args.code ?? "").trim()
  if (!code) throw new WhoError("Provide a WHO indicator code like WHOSIS_000001")
  const limit = Math.min(args.limit ?? 10, 25)
  const d = await get<any>(`${BASE}/${encodeURIComponent(code)}?$top=${limit}`)
  const rows = (d?.value ?? []) as any[]
  if (!rows.length) return `No data for indicator ${code}`
  const lines = rows.map((r: any) => {
    const place = r?.SpatialDim ?? "global"
    const time = r?.TimeDim ?? ""
    const val = r?.NumericValue != null ? Number(r.NumericValue).toLocaleString() : (r?.Value ?? "n/a")
    return `${place} ${time}: ${val}`
  })
  return `WHO indicator ${code}:\n` + lines.join("\n")
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new WhoError("Provide a search query")
  const limit = Math.min(args.limit ?? 10, 25)
  const d = await get<any>(
    `${BASE}/Indicator?$filter=contains(IndicatorName,'${q.replace(/'/g, "''")}')&$top=${limit}&$select=IndicatorCode,IndicatorName`
  )
  const rows = (d?.value ?? []) as any[]
  if (!rows.length) return `No WHO indicators match \"${q}\"`
  return `WHO indicators matching \"${q}\":\n` + rows.map((r: any, i: number) => `${i + 1}. ${r?.IndicatorCode ?? "n/a"} | ${r?.IndicatorName ?? "n/a"}`).join("\n")
}
