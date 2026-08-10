const UA = "mrfentmen-digimon-mcp/1.0 (https://github.com/mrfentmen)"
const BASE = "https://digimon-api.vercel.app/api"

export class DigimonError extends Error {}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new DigimonError(`Digimon API returned HTTP ${res.status}`)
  return (await res.json()) as T
}

interface Digimon {
  name: string
  img: string
  level: string
}

export async function search(args: { name?: string; limit?: number }): Promise<string> {
  const name = (args.name ?? "").trim()
  if (!name) throw new DigimonError("Provide a Digimon name")
  const limit = Math.min(args.limit ?? 10, 50)
  const data = await get<Digimon[]>(`/digimon/name/${encodeURIComponent(name)}`)
  const list = data.slice(0, limit)
  if (!list.length) return `No Digimon found for "${name}"`
  return list.map((d, i) => `${i + 1}. ${d.name} | Level: ${d.level}`).join("\n")
}

export async function level(args: { level?: string; limit?: number }): Promise<string> {
  const level = (args.level ?? "").trim()
  if (!level) throw new DigimonError("Provide a level like Rookie or Champion")
  const limit = Math.min(args.limit ?? 10, 50)
  const data = await get<Digimon[]>(`/digimon/level/${encodeURIComponent(level)}`)
  const list = data.slice(0, limit)
  if (!list.length) return `No Digimon at level "${level}"`
  return list.map((d, i) => `${i + 1}. ${d.name} | Level: ${d.level}`).join("\n")
}
