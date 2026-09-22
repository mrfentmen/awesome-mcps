/**
 * Trakt API client. Needs TRAKT_API_KEY (free at https://trakt.tv/oauth/applications).
 * Docs: https://trakt.docs.apiary.io/
 */
const BASE = "https://api.trakt.tv"

export class TraktError extends Error {}

function headers(): Record<string, string> {
  const key = process.env.TRAKT_API_KEY
  if (!key) throw new TraktError("Set TRAKT_API_KEY first (free at trakt.tv/oauth/applications).")
  return {
    "User-Agent": "trakt-mcp/1.0",
    Accept: "application/json",
    "Content-Type": "application/json",
    "trakt-api-version": "2",
    "trakt-api-key": key,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: headers(),
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new TraktError("Trakt refused (401/403). Check API key.")
  if (res.status === 404) throw new TraktError("Not found.")
  if (res.status === 429) throw new TraktError("Trakt rate limit hit; wait and retry.")
  if (!res.ok) throw new TraktError(`Trakt error ${res.status}`)
  return (await res.json()) as T
}

export interface Show {
  title?: string
  year?: number
  ids: Raw
}

export async function searchShows(query: string, limit = 5): Promise<Show[]> {
  if (!query.trim()) throw new TraktError("Query is empty.")
  const data = await getJson<Raw[]>(`/search/show?query=${encodeURIComponent(query.trim())}`)
  return data.slice(0, limit).map((r) => {
    const s: Raw = r.show ?? {}
    return { title: s.title, year: s.year, ids: s.ids ?? {} }
  })
}

export async function trendingShows(limit = 5): Promise<Show[]> {
  const data = await getJson<Raw[]>(`/shows/trending?limit=${Math.min(Math.max(limit, 1), 100)}`)
  return data.slice(0, limit).map((r) => {
    const s: Raw = r.show ?? {}
    return { title: s.title, year: s.year, ids: s.ids ?? {} }
  })
}

export async function trendingMovies(limit = 5): Promise<Show[]> {
  const data = await getJson<Raw[]>(`/movies/trending?limit=${Math.min(Math.max(limit, 1), 100)}`)
  return data.slice(0, limit).map((r) => {
    const m: Raw = r.movie ?? {}
    return { title: m.title, year: m.year, ids: m.ids ?? {} }
  })
}

export function imdbOf(ids: Raw): string {
  return ids.imdb ? `https://www.imdb.com/title/${ids.imdb}/` : ""
}

export function formatShow(s: Show, imdb: string, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}${s.title ?? "(untitled)"}${s.year ? ` (${s.year})` : ""}${imdb ? `\n   ${imdb}` : ""}`
}
