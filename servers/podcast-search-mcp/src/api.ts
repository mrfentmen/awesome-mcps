const BASE = "https://itunes.apple.com"
const UA = "mrfentmen-podcast-search-mcp/1.0 (https://github.com/mrfentmen)"
export class PodcastError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new PodcastError(`iTunes error ${res.status}`)
  return (await res.json()) as T
}

export async function searchPodcasts(args: { query?: string; limit?: number }): Promise<string> {
  const q = encodeURIComponent(args.query ?? "")
  const limit = Math.min(args.limit ?? 8, 20)
  const d = await get<any>(`${BASE}/search?term=${q}&limit=${limit}&media=podcast`)
  const rows = d.results ?? []
  return rows.map((p: any, i: number) =>
    `${i + 1}. ${p.collectionName ?? ""}\n   ${p.artistName ?? ""} | ${p.trackCount ?? "?"} episodes | ${p.primaryGenreName ?? ""}\n   ${p.collectionViewUrl ?? ""}`
  ).join("\n\n") || "No podcasts found"
}

export async function topPodcasts(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 25)
  const d = await get<any>(`${BASE}/us/rss/toppodcasts/limit=${limit}/json`)
  const rows = d.feed?.entry ?? []
  return rows.map((p: any, i: number) => {
    const name = typeof p["im:name"]?.label === "string" ? p["im:name"].label : ""
    const artist = typeof p["im:artist"]?.label === "string" ? p["im:artist"].label : ""
    return `${i + 1}. ${name}\n   ${artist}`
  }).join("\n") || "No podcasts found"
}
