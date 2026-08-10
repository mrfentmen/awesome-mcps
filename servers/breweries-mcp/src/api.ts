const BASE = "https://api.openbrewerydb.org/v1/breweries"
const UA = "mrfentmen-breweries-mcp/1.0 (https://github.com/mrfentmen)"
export class BreweryError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new BreweryError("OpenBreweryDB rate limit hit, wait and retry")
  if (!res.ok) throw new BreweryError(`OpenBreweryDB error ${res.status}`)
  return (await res.json()) as T
}

function fmtB(b: any): string {
  const parts = [b?.name ?? "Untitled", b?.brewery_type ? `(${b.brewery_type})` : ""].filter(Boolean).join(" ")
  const loc = [b?.city, b?.state_province, b?.country].filter(Boolean).join(", ")
  return `${parts}${loc ? `\n   ${loc}` : ""}${b?.website_url ? `\n   ${b.website_url}` : ""}`
}

export async function byCity(args: { city?: string; limit?: number }): Promise<string> {
  const city = (args.city ?? "").trim()
  if (!city) throw new BreweryError("Provide a city name")
  const limit = Math.min(args.limit ?? 10, 25)
  const d = await get<any[]>(`${BASE}?by_city=${encodeURIComponent(city)}&per_page=${limit}`)
  if (!d.length) return `No breweries in ${city}`
  return d.map(fmtB).join("\n\n")
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new BreweryError("Provide a brewery name")
  const limit = Math.min(args.limit ?? 10, 25)
  const d = await get<any[]>(`${BASE}?by_name=${encodeURIComponent(q)}&per_page=${limit}`)
  if (!d.length) return "No breweries found"
  return d.map(fmtB).join("\n\n")
}

export async function byState(args: { state?: string; limit?: number }): Promise<string> {
  const state = (args.state ?? "").trim()
  if (!state) throw new BreweryError("Provide a state name")
  const limit = Math.min(args.limit ?? 10, 25)
  const d = await get<any[]>(`${BASE}?by_state=${encodeURIComponent(state)}&per_page=${limit}`)
  if (!d.length) return `No breweries in ${state}`
  return d.map(fmtB).join("\n\n")
}
