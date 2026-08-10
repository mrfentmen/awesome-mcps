const BASE = "https://countriesnow.space/api/v0.1/countries"
const UA = "mrfentmen-countries-mcp/1.0 (https://github.com/mrfentmen)"
export class CountriesError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, redirect: "follow", signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new CountriesError("Countries API rate limit hit, wait and retry")
  if (!res.ok) throw new CountriesError(`Countries API error ${res.status}`)
  return (await res.json()) as T
}

async function flagData(country: string): Promise<any> {
  const d = await get<any>(`${BASE}/flag/images/q?country=${encodeURIComponent(country)}`)
  if (d?.error) throw new CountriesError(d?.msg ?? "Country not found")
  return d?.data ?? {}
}

export async function byName(args: { name?: string }): Promise<string> {
  const name = (args.name ?? "").trim()
  if (!name) throw new CountriesError("Provide a country name")
  const iso = await get<any>(`${BASE}/iso/q?country=${encodeURIComponent(name)}`)
  if (iso?.error) throw new CountriesError(iso?.msg ?? "Country not found")
  const f = await flagData(name)
  const pop = await get<any>(`${BASE}/population/q?country=${encodeURIComponent(name)}`)
  const counts = pop?.data?.populationCounts ?? []
  const latest = counts[counts.length - 1]
  return `${f?.name ?? name} (${f?.iso2 ?? ""} / ${f?.iso3 ?? ""})\nFlag: ${f?.flag ?? "n/a"}\nPopulation ${latest?.year ?? "n/a"}: ${latest?.value ? latest.value.toLocaleString() : "n/a"}`
}

export async function byCode(args: { code?: string }): Promise<string> {
  const code = (args.code ?? "").trim().toUpperCase()
  if (!code) throw new CountriesError("Provide a two letter country code")
  const d = await get<any>(`${BASE}/flag/images`)
  const all = d?.data ?? []
  const hit = all.find((c: any) => (c?.iso2 ?? "").toUpperCase() === code)
  if (!hit) throw new CountriesError("Country not found")
  return byName({ name: hit.name })
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new CountriesError("Provide a partial name")
  const limit = Math.min(args.limit ?? 15, 30)
  const d = await get<any>(`${BASE}/flag/images`)
  const all = d?.data ?? []
  const hits = all.filter((c: any) => (c?.name ?? "").toLowerCase().includes(q.toLowerCase())).slice(0, limit)
  if (!hits.length) return "No countries match"
  return hits.map((c: any, i: number) => `${i + 1}. ${c.name} (${c.iso2 ?? ""}) | ${c.flag ?? ""}`).join("\n")
}
