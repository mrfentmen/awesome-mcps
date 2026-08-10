const BASE = "https://api.urbandictionary.com/v0"
const UA = "mrfentmen-urban-dictionary-mcp/1.0 (https://github.com/mrfentmen)"
export class UrbanError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new UrbanError("Urban Dictionary rate limit hit, wait and retry")
  if (!res.ok) throw new UrbanError(`Urban Dictionary error ${res.status}`)
  return (await res.json()) as T
}

function fmtEntry(e: any, i: number): string {
  return `${i + 1}. ${e?.word ?? "Untitled"}\n   ${(e?.definition ?? "").slice(0, 300)}\n   Example: ${(e?.example ?? "").slice(0, 150)}${e?.author ? `\n   by ${e.author}` : ""}`
}

export async function define(args: { term?: string; limit?: number }): Promise<string> {
  const term = (args.term ?? "").trim()
  if (!term) throw new UrbanError("Provide a term to look up")
  const limit = Math.min(args.limit ?? 3, 10)
  const d = await get<any>(`${BASE}/define?term=${encodeURIComponent(term)}`)
  const list = d?.list ?? []
  if (!list.length) return `No definitions for "${term}"`
  return list.slice(0, limit).map(fmtEntry).join("\n\n")
}

export async function random(args: Record<string, never>): Promise<string> {
  const d = await get<any>(`${BASE}/random`)
  const list = d?.list ?? []
  if (!list.length) return "No entries returned"
  return fmtEntry(list[0], 0)
}
