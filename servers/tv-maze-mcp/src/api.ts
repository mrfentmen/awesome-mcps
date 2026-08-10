const BASE = "https://api.tvmaze.com"
const UA = "mrfentmen-tv-maze-mcp/1.0 (https://github.com/mrfentmen)"
export class TvError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new TvError("TVMaze rate limit hit, wait and retry")
  if (!res.ok) throw new TvError(`TVMaze error ${res.status}`)
  return (await res.json()) as T
}

export async function searchShows(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new TvError("Provide a show name")
  const limit = Math.min(args.limit ?? 5, 15)
  const d = await get<any[]>(`${BASE}/search/shows?q=${encodeURIComponent(q)}`)
  if (!d.length) return "No shows found"
  return d.slice(0, limit).map((r: any, i: number) => {
    const s = r?.show ?? {}
    return `${i + 1}. ${s.name ?? "Untitled"} (${s.premiered ? s.premiered.slice(0, 4) : "year n/a"}) | rating ${s.rating?.average ?? "n/a"}\n   ${s.genres?.length ? s.genres.join(", ") : ""} | id ${s.id}\n   ${s.summary ? s.summary.replace(/<[^>]+>/g, "").slice(0, 160) : "no summary"}`
  }).join("\n\n")
}

export async function showEpisodes(args: { showId?: number }): Promise<string> {
  const id = args.showId
  if (id === undefined || id <= 0) throw new TvError("Provide a TVMaze show ID")
  const d = await get<any[]>(`${BASE}/shows/${id}/episodes`)
  if (!d.length) return "No episodes found"
  return d.map((e: any) => `S${String(e.season).padStart(2, "0")}E${String(e.number).padStart(2, "0")} ${e.name} (${e.airdate ?? ""})`).join("\n")
}

export async function todaySchedule(args: { country?: string }): Promise<string> {
  const country = (args.country ?? "US").toUpperCase()
  const d = await get<any[]>(`${BASE}/schedule?country=${encodeURIComponent(country)}`)
  if (!d.length) return "No schedule for today"
  return d.slice(0, 20).map((e: any, i: number) => `${i + 1}. ${e.show?.name ?? "Untitled"} | ${e.name ?? ""} | ${e.airtime ?? ""}`).join("\n")
}
