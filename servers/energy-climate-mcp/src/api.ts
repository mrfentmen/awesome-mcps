const UA = "mrfentmen-energy-climate-mcp/1.0 (https://github.com/mrfentmen)"
export class EnergyError extends Error {}

export async function worldbankIndicator(args: { indicator?: string; country?: string }): Promise<string> {
  const ind = encodeURIComponent(args.indicator ?? "EG.USE.ELEC.KH.PC")
  const country = encodeURIComponent(args.country ?? "USA")
  const res = await fetch(`https://api.worldbank.org/v2/country/${country}/indicator/${ind}?format=json&per_page=20`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new EnergyError(`World Bank error ${res.status}`)
  const d = await res.json()
  const meta = d[1]?.[0]?.indicator?.value ?? ind
  const rows = (d[1] ?? []).filter((r: any) => r.value != null).slice(-15)
  return `${meta} for ${d[1]?.[0]?.country?.value ?? country}\n${rows.map((r: any) => `${r.date}: ${r.value}`).join("\n") || "No data"}`
}

export async function eiaSeries(args: { series_id?: string }): Promise<string> {
  const key = process.env.EIA_API_KEY
  if (!key) throw new EnergyError("Set the EIA_API_KEY environment variable to your free EIA key")
  const id = encodeURIComponent(args.series_id ?? "")
  const res = await fetch(`https://api.eia.gov/v2/series/?api_key=${key}&series_id=${id}`, { signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new EnergyError(`EIA error ${res.status}`)
  const d = await res.json()
  const series = d.response?.data?.[0]
  const rows = (series?.data ?? []).slice(-15)
  return `${series?.name ?? id}\n${rows.map((r: any) => `${r.period}: ${r.value}`).join("\n") || "No data"}`
}
