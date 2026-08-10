const BASE = "https://icanhazdadjoke.com"
const UA = "mrfentmen-dad-jokes-mcp/1.0 (https://github.com/mrfentmen)"
export class DadjokesError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new DadjokesError(`icanhazdadjoke returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function random(_args?: unknown): Promise<string> {
  const d = await get<any>(`${BASE}/`)
  return d?.joke ?? "No joke found"
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new DadjokesError("Provide a search query")
  const limit = Math.min(args.limit ?? 8, 20)
  const d = await get<any>(`${BASE}/search?term=${encodeURIComponent(q)}&limit=${limit}`)
  const results = (d?.results ?? []) as any[]
  if (!results.length) return `No dad jokes found for \"${q}\"`
  return `Dad jokes matching \"${q}\" (${d?.total_jokes ?? results.length} total):\n` + results.map((j, i) => `${i + 1}. ${j?.joke ?? ""}`).join("\n")
}
