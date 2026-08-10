const BASE = "https://www.swapi.tech/api"
const UA = "mrfentmen-star-wars-mcp/1.0 (https://github.com/mrfentmen)"
export class StarWarsError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new StarWarsError("SWAPI rate limit hit, wait and retry")
  if (!res.ok) throw new StarWarsError(`SWAPI error ${res.status}`)
  return (await res.json()) as T
}

export async function peopleInfo(args: { id?: number }): Promise<string> {
  const id = args.id
  if (id === undefined || id <= 0) throw new StarWarsError("Provide a person ID")
  const d = await get<any>(`${BASE}/people/${id}`)
  const p = d?.result?.properties ?? {}
  return `Name: ${p.name ?? "n/a"}\nHeight: ${p.height ?? "n/a"} cm | Mass: ${p.mass ?? "n/a"} kg\nHair: ${p.hair_color ?? "n/a"} | Skin: ${p.skin_color ?? "n/a"} | Eyes: ${p.eye_color ?? "n/a"}\nBorn: ${p.birth_year ?? "n/a"} | Gender: ${p.gender ?? "n/a"}`
}

export async function planetInfo(args: { id?: number }): Promise<string> {
  const id = args.id
  if (id === undefined || id <= 0) throw new StarWarsError("Provide a planet ID")
  const d = await get<any>(`${BASE}/planets/${id}`)
  const p = d?.result?.properties ?? {}
  return `Name: ${p.name ?? "n/a"}\nClimate: ${p.climate ?? "n/a"} | Terrain: ${p.terrain ?? "n/a"}\nPopulation: ${p.population ?? "n/a"} | Gravity: ${p.gravity ?? "n/a"}\nDiameter: ${p.diameter ?? "n/a"} km | Rotation: ${p.rotation_period ?? "n/a"} hours`
}

export async function searchPeople(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new StarWarsError("Provide a character name")
  const limit = Math.min(args.limit ?? 5, 10)
  const d = await get<any>(`${BASE}/people/?name=${encodeURIComponent(q)}`)
  const res = d?.result ?? []
  if (!res.length) return "No characters found"
  return res.slice(0, limit).map((r: any, i: number) => `${i + 1}. ${r?.properties?.name ?? "n/a"} (id ${r?.uid ?? "?"})`).join("\n")
}
