const BASE = "https://dog.ceo/api"
const UA = "mrfentmen-dog-breeds-mcp/1.0 (https://github.com/mrfentmen)"
export class DogError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new DogError(`Dog API error ${res.status}`)
  return (await res.json()) as T
}

export async function listBreeds(_args: Record<string, never>): Promise<string> {
  const d = await get<any>(`${BASE}/breeds/list/all`)
  const breeds = d.message ?? {}
  const names = Object.entries(breeds as Record<string, string[]>)
    .map(([breed, subs]) => subs.length ? `${breed} (${subs.join(", ")})` : breed)
  return `${names.length} breeds\n${names.slice(0, 60).join("\n")}`
}

export async function randomImage(args: { breed?: string }): Promise<string> {
  const breed = (args.breed ?? "").trim().toLowerCase()
  const url = breed ? `${BASE}/breed/${encodeURIComponent(breed)}/images/random` : `${BASE}/breeds/image/random`
  const d = await get<any>(url)
  if (d.status !== "success") throw new DogError(d.message ?? "Breed not found")
  return d.message
}
