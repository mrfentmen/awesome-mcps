const KEY = process.env.TMDB_API_KEY ?? ""
const BASE = "https://api.themoviedb.org/3"
export class TmdbError extends Error {}

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  if (!KEY) throw new TmdbError("Set the TMDB_API_KEY environment variable to your free TMDB key")
  const qs = new URLSearchParams({ api_key: KEY, ...params }).toString()
  const res = await fetch(`${BASE}${path}?${qs}`, { signal: AbortSignal.timeout(25000) })
  if (res.status === 401) throw new TmdbError("TMDB rejected the key. Check TMDB_API_KEY.")
  if (!res.ok) throw new TmdbError(`TMDB error ${res.status}`)
  return (await res.json()) as T
}

function fmtRows(rows: any[]): string {
  return rows.map((r: any) =>
    `${r.title ?? r.name ?? ""} (${(r.release_date ?? r.first_air_date ?? "").slice(0, 4)}) | rating ${r.vote_average ?? "n/a"}\n  ${(r.overview ?? "").slice(0, 180)}`
  ).join("\n\n")
}

export async function searchMovie(args: { query?: string; limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 8, 20)
  const d = await get<any>("/search/movie", { query: args.query ?? "", include_adult: "false" })
  return `Movies matching ${args.query}\n${fmtRows((d.results ?? []).slice(0, limit)) || "None found"}`
}

export async function searchTv(args: { query?: string; limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 8, 20)
  const d = await get<any>("/search/tv", { query: args.query ?? "", include_adult: "false" })
  return `TV shows matching ${args.query}\n${fmtRows((d.results ?? []).slice(0, limit)) || "None found"}`
}

export async function trending(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 20)
  const d = await get<any>("/trending/all/week", {})
  return `Trending this week\n${fmtRows((d.results ?? []).slice(0, limit))}`
}
