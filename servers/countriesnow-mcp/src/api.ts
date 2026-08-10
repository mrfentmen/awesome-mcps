const BASE = "https://countriesnow.space/api/v0.1"
const UA = "mrfentmen-countriesnow-mcp/1.0 (https://github.com/mrfentmen)"
export class CountriesnowError extends Error {}

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

export async function countries(args: { limit?: number }): Promise<string> {
  const d = await get<any>(`${BASE}/countries`)
  const list = (d?.data ?? []) as any[]
  if (!list.length) return "No countries found"
  const shown = list.slice(0, Math.min(args.limit ?? 50, 100))
  const withCities = list.filter((c: any) => (c?.cities ?? []).length > 0).length
  return `Countries (${list.length} total, ${shown.length} shown, ${withCities} with city data):\n` + shown.map((c, i) => {
    return `${i + 1}. ${c?.country ?? "n/a"} (${c?.iso2 ?? ""}/${c?.iso3 ?? ""}) | ${(c?.cities ?? []).length} cities`
  }).join("\n")
}

export async function cities(args: { country?: string }): Promise<string> {
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

export async function flag(args: { country?: string }): Promise<string> {
  const country = (args.country ?? "").trim().toLowerCase()
  if (!country) throw new CountriesnowError("Provide a country name")
  const d = await get<any>(`${BASE}/countries/flag/images`)
  const list = (d?.data ?? []) as any[]
  const hit = list.find((c: any) => String(c?.name ?? "").toLowerCase() === country)
  if (!hit) throw new CountriesnowError(`Flag not found for ${args.country}`)
  return `${hit.name} flag:\n${hit.flag}\n${hit.iso2 ? `ISO2: ${hit.iso2}` : ""}`
}
