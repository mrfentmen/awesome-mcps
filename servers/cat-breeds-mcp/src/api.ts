const BASE = "https://api.thecatapi.com/v1/breeds"
const UA = "mrfentmen-cat-breeds-mcp/1.0 (https://github.com/mrfentmen)"
export class CatError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new CatError(`Cat API error ${res.status}`)
  return (await res.json()) as T
}

export async function listBreeds(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 20, 60)
  const d = await get<any[]>(`${BASE}?limit=${limit}`)
  return d.map((b: any) =>
    `${b.name ?? ""} (${b.origin ?? ""})\n  Temperament: ${(b.temperament ?? "").slice(0, 120)}\n  Life span: ${b.life_span ?? "?"} years`
  ).join("\n\n") || "No breeds found"
}

export async function breedInfo(args: { breed_id?: string }): Promise<string> {
  const id = (args.breed_id ?? "").trim().toLowerCase()
  if (!id) throw new CatError("Provide a breed id")
  const d = await get<any[]>(`${BASE}/search?q=${encodeURIComponent(id)}`)
  const b = d[0]
  if (!b) throw new CatError("Breed not found")
  return [
    `${b.name ?? ""} (${b.origin ?? ""})`,
    `Temperament: ${b.temperament ?? ""}`,
    `Weight: ${b.weight?.metric ?? "?"} kg`,
    `Life span: ${b.life_span ?? "?"} years`,
    `Description: ${(b.description ?? "").slice(0, 300)}`,
    `Wikipedia: ${b.wikipedia_url ?? "n/a"}`,
  ].join("\n")
}
