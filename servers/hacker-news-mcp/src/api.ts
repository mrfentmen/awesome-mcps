const UA = "mrfentmen-hacker-news-mcp/1.0 (https://github.com/mrfentmen)"
const BASE = "https://hacker-news.firebaseio.com/v0"

export class HnError extends Error {}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new HnError(`Hacker News returned HTTP ${res.status}`)
  return (await res.json()) as T
}

interface Item {
  id: number
  title?: string
  url?: string
  score?: number
  by?: string
  time?: number
  descendants?: number
  text?: string
}

async function getItem(id: number): Promise<Item> {
  return get<Item>(`item/${id}.json`)
}

async function list(ids: number[], limit: number): Promise<string> {
  const rows: string[] = []
  for (const id of ids.slice(0, limit)) {
    try {
      const it = await getItem(id)
      if (it && it.title) {
        rows.push(`${it.id} | ${it.title} | points ${it.score ?? 0} | comments ${it.descendants ?? 0}${it.url ? "" : " (text)"}`)
      }
    } catch {
      // skip failed item
    }
  }
  return rows.join("\n")
}

export async function top(args: { limit?: number }): Promise<string> {
  const ids = await get<number[]>("topstories.json")
  return (await list(ids, Math.min(args.limit ?? 10, 30))) || "No stories right now"
}

export async function jobs(args: { limit?: number }): Promise<string> {
  const ids = await get<number[]>("jobstories.json")
  return (await list(ids, Math.min(args.limit ?? 10, 30))) || "No jobs right now"
}

export async function ask(args: { limit?: number }): Promise<string> {
  const ids = await get<number[]>("askstories.json")
  return (await list(ids, Math.min(args.limit ?? 10, 30))) || "No ask threads right now"
}

export async function item(args: { id?: number }): Promise<string> {
  const id = args.id
  if (id === undefined || !Number.isInteger(id)) throw new HnError("Provide an item ID")
  const it = await getItem(id)
  if (!it) throw new HnError(`Item ${id} not found`)
  return [
    `${it.title ?? "untitled"} (id ${it.id})`,
    `By ${it.by ?? "n/a"} at ${it.time ? new Date(it.time * 1000).toISOString().slice(0, 16).replace("T", " ") : "n/a"}`,
    `Points ${it.score ?? 0} | comments ${it.descendants ?? 0}`,
    it.url ? `Link: ${it.url}` : "",
    it.text ? `\n${it.text.slice(0, 1000)}` : "",
  ].filter(Boolean).join("\n")
}
