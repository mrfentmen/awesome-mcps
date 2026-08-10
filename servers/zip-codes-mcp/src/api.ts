const BASE = "https://api.zippopotam.us/us"
const UA = "mrfentmen-zip-codes-mcp/1.0 (https://github.com/mrfentmen)"
export class ZipError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new ZipError("Zippopotam rate limit hit, wait and retry")
  if (!res.ok) throw new ZipError(`Zippopotam error ${res.status}`)
  return (await res.json()) as T
}

export async function zipLookup(args: { zip?: string }): Promise<string> {
  const zip = (args.zip ?? "").trim()
  if (!/^\d{5}$/.test(zip)) throw new ZipError("Provide a five digit US zip code")
  const d = await get<any>(`${BASE}/${zip}`)
  const places = d?.places ?? []
  if (!places.length) return `No data for ${zip}`
  const postCode = d?.["post code"] ?? zip
  return places.map((p: any) => `${postCode} | ${p?.["place name"] ?? "n/a"}, ${p?.["state abbreviation"] ?? ""} ${p?.longitude ?? ""}, ${p?.latitude ?? ""}`).join("\n")
}

export async function cityLookup(args: { city?: string; state?: string }): Promise<string> {
  const city = (args.city ?? "").trim().toLowerCase()
  const state = (args.state ?? "").trim().toLowerCase()
  if (!city || !state) throw new ZipError("Provide a city and two letter state")
  const d = await get<any>(`${BASE}/${encodeURIComponent(city)}/${state}`)
  const places = d?.places ?? []
  if (!places.length) return `No data for ${city}, ${state}`
  const zips = [...new Set(places.map((p: any) => p?.["post code"]).filter(Boolean))]
  return `${city[0].toUpperCase()}${city.slice(1)}, ${state.toUpperCase()}\nZip codes: ${zips.join(", ")}`
}
