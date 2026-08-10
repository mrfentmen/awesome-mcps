const BASE = "https://dog.ceo/api"
const UA = "mrfentmen-dog-images-mcp/1.0 (https://github.com/mrfentmen)"
export class DogError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new DogError("dog.ceo rate limit hit, wait and retry")
  if (!res.ok) throw new DogError(`dog.ceo error ${res.status}`)
  return (await res.json()) as T
}

export async function randomDog(args: Record<string, never>): Promise<string> {
  const d = await get<any>(`${BASE}/breeds/image/random`)
  return d?.message ?? "No image returned"
}

export async function byBreed(args: { breed?: string }): Promise<string> {
  const breed = (args.breed ?? "").trim().toLowerCase()
  if (!breed) throw new DogError("Provide a breed name")
  const d = await get<any>(`${BASE}/breed/${encodeURIComponent(breed)}/images/random`)
  if (d?.status === "error") throw new DogError(`Breed "${breed}" not found`)
  return `${breed}:\n${d?.message ?? "No image returned"}`
}

export async function listBreeds(args: Record<string, never>): Promise<string> {
  const d = await get<any>(`${BASE}/breeds/list/all`)
  const breeds = Object.keys(d?.message ?? {})
  if (!breeds.length) return "No breeds found"
  return `Available breeds (${breeds.length}):\n${breeds.sort().join(", ")}`
}
