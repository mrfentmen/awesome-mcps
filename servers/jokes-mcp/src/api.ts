const BASE = "https://icanhazdadjoke.com"
const UA = "mrfentmen-jokes-mcp/1.0 (https://github.com/mrfentmen)"
export class JokesError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new JokesError("icanhazdadjoke rate limit hit, wait and retry")
  if (!res.ok) throw new JokesError(`icanhazdadjoke error ${res.status}`)
  return (await res.json()) as T
}

export async function randomJoke(args: Record<string, never>): Promise<string> {
  const d = await get<any>(`${BASE}/`)
  return d?.joke ?? "No joke returned"
}

export async function searchJokes(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new JokesError("Provide a search term")
  const limit = Math.min(args.limit ?? 5, 20)
  const d = await get<any>(`${BASE}/search?term=${encodeURIComponent(q)}&limit=${limit}`)
  const results = d?.results ?? []
  if (!results.length) return "No jokes found"
  return results.map((j: any, i: number) => `${i + 1}. ${j.joke}`).join("\n\n")
}
