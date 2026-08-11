const m0 = (() => {
const BASE = "https://countriesnow.space/api/v0.1"
const UA = "mrfentmen-countriesnow-mcp/1.0 (https://github.com/mrfentmen)"
class CountriesnowError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new CountriesnowError(`CountriesNow returned HTTP ${res.status}`)
  return (await res.json()) as T
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": UA, Accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new CountriesnowError(`CountriesNow returned HTTP ${res.status}`)
  return (await res.json()) as T
}

async function countries(args: { limit?: number }): Promise<string> {
  const d = await get<any>(`${BASE}/countries`)
  const list = (d?.data ?? []) as any[]
  if (!list.length) return "No countries found"
  const shown = list.slice(0, Math.min(args.limit ?? 50, 100))
  const withCities = list.filter((c: any) => (c?.cities ?? []).length > 0).length
  return `Countries (${list.length} total, ${shown.length} shown, ${withCities} with city data):\n` + shown.map((c, i) => {
    return `${i + 1}. ${c?.country ?? "n/a"} (${c?.iso2 ?? ""}/${c?.iso3 ?? ""}) | ${(c?.cities ?? []).length} cities`
  }).join("\n")
}

async function cities(args: { country?: string }): Promise<string> {
  const country = (args.country ?? "").trim()
  if (!country) throw new CountriesnowError("Provide a country name")
  const d = await post<any>(`${BASE}/countries/cities`, { country })
  if (!d?.data) throw new CountriesnowError(`No cities found for ${country}`)
  const list = (d.data as string[]).filter(Boolean)
  const shown = list.slice(0, 40)
  const lines = [`Cities in ${country} (${list.length} total):`]
  for (let i = 0; i < shown.length; i += 4) {
    lines.push(shown.slice(i, i + 4).join(" | "))
  }
  if (list.length > 40) lines.push(`... and ${list.length - 40} more`)
  return lines.join("\n")
}

async function flag(args: { country?: string }): Promise<string> {
  const country = (args.country ?? "").trim().toLowerCase()
  if (!country) throw new CountriesnowError("Provide a country name")
  const d = await get<any>(`${BASE}/countries/flag/images`)
  const list = (d?.data ?? []) as any[]
  const hit = list.find((c: any) => String(c?.name ?? "").toLowerCase() === country)
  if (!hit) throw new CountriesnowError(`Flag not found for ${args.country}`)
  return `${hit.name} flag:\n${hit.flag}\n${hit.iso2 ? `ISO2: ${hit.iso2}` : ""}`
}

return { CountriesnowError, cities, countries, flag };
})();

const m1 = (() => {
const BASE = "https://countriesnow.space/api/v0.1/countries"
const UA = "mrfentmen-countries-mcp/1.0 (https://github.com/mrfentmen)"
class CountriesError extends Error {}

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

async function byName(args: { name?: string }): Promise<string> {
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

async function byCode(args: { code?: string }): Promise<string> {
  const code = (args.code ?? "").trim().toUpperCase()
  if (!code) throw new CountriesError("Provide a two letter country code")
  const d = await get<any>(`${BASE}/flag/images`)
  const all = d?.data ?? []
  const hit = all.find((c: any) => (c?.iso2 ?? "").toUpperCase() === code)
  if (!hit) throw new CountriesError("Country not found")
  return byName({ name: hit.name })
}

async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new CountriesError("Provide a partial name")
  const limit = Math.min(args.limit ?? 15, 30)
  const d = await get<any>(`${BASE}/flag/images`)
  const all = d?.data ?? []
  const hits = all.filter((c: any) => (c?.name ?? "").toLowerCase().includes(q.toLowerCase())).slice(0, limit)
  if (!hits.length) return "No countries match"
  return hits.map((c: any, i: number) => `${i + 1}. ${c.name} (${c.iso2 ?? ""}) | ${c.flag ?? ""}`).join("\n")
}

return { CountriesError, byCode, byName, search };
})();

export const CountriesError = m1.CountriesError;
export const CountriesnowError = m0.CountriesnowError;
export const byCode = m1.byCode;
export const byName = m1.byName;
export const cities = m0.cities;
export const countries = m0.countries;
export const flag = m0.flag;
export const search = m1.search;
export const m0_countries = m0.countries;
export const m0_CountriesnowError = m0.CountriesnowError;
export const m0_cities = m0.cities;
export const m0_flag = m0.flag;
export const m1_search = m1.search;
export const m1_CountriesError = m1.CountriesError;
export const m1_byCode = m1.byCode;
export const m1_byName = m1.byName;
