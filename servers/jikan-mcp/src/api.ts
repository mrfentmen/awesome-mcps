const BASE = "https://api.jikan.moe/v4"
const UA = "mrfentmen-jikan-mcp/1.0 (https://github.com/mrfentmen)"
export class JikanError extends Error {}

async function get<T>(url: string, retries = 2): Promise<T> {
  let last: unknown = null
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
      if (res.status === 429 || res.status === 504) {
        last = new JikanError(`Jikan is busy (${res.status}), wait and retry`)
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
        continue
      }
      if (!res.ok) throw new JikanError(`Jikan error ${res.status}`)
      return (await res.json()) as T
    } catch (e) {
      last = e
      if (e instanceof JikanError && !String(e.message).startsWith("Jikan is busy")) throw e
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
    }
  }
  throw last instanceof Error ? last : new JikanError("Jikan request failed")
}

export async function searchAnime(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new JikanError("Provide an anime title")
  const limit = Math.min(args.limit ?? 5, 15)
  const d = await get<any>(`${BASE}/anime?q=${encodeURIComponent(q)}&limit=${limit}&sfw=true`)
  const items = d?.data ?? []
  if (!items.length) return "No anime found"
  return items.map((a: any, i: number) => `${i + 1}. ${a.title} (${a.year ?? "year n/a"}) | score ${a.score ?? "n/a"} | id ${a.mal_id}\n   ${a.synopsis ? a.synopsis.slice(0, 160) + "..." : "no synopsis"}`).join("\n\n")
}

export async function animeInfo(args: { animeId?: number }): Promise<string> {
  const id = args.animeId
  if (id === undefined || id <= 0) throw new JikanError("Provide a MyAnimeList anime ID")
  const d = await get<any>(`${BASE}/anime/${id}/full`)
  const a = d?.data ?? {}
  return `Title: ${a.title}\n${a.title_english ? `English: ${a.title_english}\n` : ""}Type: ${a.type ?? "n/a"} | Episodes: ${a.episodes ?? "n/a"} | Status: ${a.status ?? "n/a"}\nScore: ${a.score ?? "n/a"} (${a.scored_by ?? "?"} votes) | Rank: ${a.rank ?? "n/a"}\nGenres: ${(a.genres ?? []).map((g: any) => g.name).join(", ") || "n/a"}\n${a.synopsis ? `\n${a.synopsis.slice(0, 400)}` : ""}`
}

export async function seasonAnime(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 20)
  const d = await get<any>(`${BASE}/seasons/now?limit=${limit}&sfw=true`)
  const items = d?.data ?? []
  if (!items.length) return "No season anime"
  return items.map((a: any, i: number) => `${i + 1}. ${a.title} | ${a.type ?? ""} | score ${a.score ?? "n/a"}`).join("\n")
}
