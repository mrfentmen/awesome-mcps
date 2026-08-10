const UA = "mrfentmen-coffee-mcp/1.0 (https://github.com/mrfentmen)"
const BASE = "https://api.sampleapis.com/coffee"

export class CoffeeError extends Error {}

interface Drink {
  title: string
  description: string
  ingredients: string[]
}

async function get(path: string): Promise<Drink[]> {
  const res = await fetch(`${BASE}/${path}`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new CoffeeError(`Coffee API returned HTTP ${res.status}`)
  return (await res.json()) as Drink[]
}

function format(list: Drink[]): string {
  return list.map((d, i) => `${i + 1}. ${d.title}\n   ${(d.description ?? "").slice(0, 120)}\n   Ingredients: ${(d.ingredients ?? []).join(", ") || "n/a"}`).join("\n\n")
}

export async function hot(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 30)
  return format((await get("hot")).slice(0, limit))
}

export async function iced(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 30)
  return format((await get("iced")).slice(0, limit))
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim().toLowerCase()
  if (!q) throw new CoffeeError("Provide a search keyword")
  const limit = Math.min(args.limit ?? 10, 30)
  const all = [...(await get("hot")), ...(await get("iced"))]
  const hits = all.filter((d) => d.title.toLowerCase().includes(q) || (d.description ?? "").toLowerCase().includes(q)).slice(0, limit)
  if (!hits.length) return `No coffee drinks match "${args.query}"`
  return format(hits)
}
