/**
 * gPodder directory API client, keyless.
 * Docs: https://gpoddernet.readthedocs.io/en/latest/api/
 */
const BASE = "https://gpodder.net"

export class GpodderError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "gpodder-mcp/1.0" },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new GpodderError(`gPodder error ${res.status}`)
  return (await res.json()) as T
}

export interface Podcast {
  title: string
  author?: string
  feed?: string
  description?: string
  subscribers?: number
  logo?: string
}

const toPodcast = (p: Raw): Podcast => ({
  title: String(p.title ?? "?"),
  author: p.author || undefined,
  feed: p.url || undefined,
  description: p.description ? String(p.description).replace(/\s+/g, " ").trim().slice(0, 160) : undefined,
  subscribers: typeof p.subscribers === "number" ? p.subscribers : undefined,
  logo: p.scaled_logo_url || p.logo_url || undefined,
});

export async function searchPodcasts(query: string, limit = 5): Promise<Podcast[]> {
  const rows = await getJson<Raw[]>(`/search.json?q=${encodeURIComponent(query)}`)
  return rows.slice(0, limit).map(toPodcast)
}

export async function topPodcasts(limit = 10): Promise<Podcast[]> {
  const rows = await getJson<Raw[]>(`/toplist/${Math.min(Math.max(limit, 1), 100)}.json`)
  return rows.slice(0, limit).map(toPodcast)
}

export interface Tag {
  tag: string
  title?: string
  usage?: number
}

export async function listTags(limit = 20): Promise<Tag[]> {
  const rows = await getJson<Raw[]>(`/api/2/tags/${Math.min(Math.max(limit, 1), 100)}.json`)
  return rows.slice(0, limit).map((t) => ({
    tag: String(t.tag ?? "?"),
    title: t.title || undefined,
    usage: typeof t.usage === "number" ? t.usage : undefined,
  }))
}

export async function podcastsByTag(tag: string, limit = 10): Promise<Podcast[]> {
  const rows = await getJson<Raw[]>(`/api/2/tag/${encodeURIComponent(tag)}/${Math.min(Math.max(limit, 1), 100)}.json`)
  return rows.slice(0, limit).map(toPodcast)
}

export function formatPodcast(p: Podcast, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  const lines = [
    `${prefix}${p.title}${p.author ? ` — ${p.author}` : ""}${p.subscribers !== undefined ? ` (${p.subscribers} subs)` : ""}`,
    p.description ? `${p.description}` : "",
    p.feed ? `Feed: ${p.feed}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}
