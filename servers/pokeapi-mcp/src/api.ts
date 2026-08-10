const BASE = "https://pokeapi.co/api/v2"
const UA = "mrfentmen-pokeapi-mcp/1.0 (https://github.com/mrfentmen)"
export class PokeError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new PokeError("PokéAPI rate limit hit, wait and retry")
  if (!res.ok) throw new PokeError(`PokéAPI error ${res.status}`)
  return (await res.json()) as T
}

export async function pokemonInfo(args: { name?: string }): Promise<string> {
  const name = (args.name ?? "").trim().toLowerCase()
  if (!name) throw new PokeError("Provide a Pokemon name or ID")
  const d = await get<any>(`${BASE}/pokemon/${encodeURIComponent(name)}`)
  const types = (d?.types ?? []).map((t: any) => t.type?.name).join(", ")
  const stats = (d?.stats ?? []).map((s: any) => `${s.stat?.name}: ${s.base_stat}`).join(" | ")
  const species = await get<any>(`${BASE}/pokemon-species/${d.id}`).catch(() => null)
  const flavor = species?.flavor_text_entries?.find((f: any) => f.language?.name === "en")?.flavor_text?.replace(/[\n\f]/g, " ") ?? ""
  return `${d.name} (#${d.id})\nTypes: ${types}\nHeight: ${(d.height ?? 0) / 10} m | Weight: ${(d.weight ?? 0) / 10} kg\nBase stats: ${stats}${flavor ? `\n\n${flavor}` : ""}`
}

export async function searchPokemon(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim().toLowerCase()
  if (!q) throw new PokeError("Provide a partial name")
  const limit = Math.min(args.limit ?? 10, 30)
  const d = await get<any>(`${BASE}/pokemon?limit=2000`)
  const hits = (d?.results ?? []).filter((p: any) => p.name.includes(q)).slice(0, limit)
  if (!hits.length) return "No Pokemon match"
  return hits.map((p: any) => p.name).join("\n")
}
