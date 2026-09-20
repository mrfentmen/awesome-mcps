/**
 * Bulbapedia (MediaWiki API) client, keyless.
 * Uses TextExtracts for clean article intros plus page URLs.
 */
const API = "https://bulbapedia.bulbagarden.net/w/api.php"

export class BulbapediaError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function api(params: Record<string, string>): Promise<Raw> {
  const qs = new URLSearchParams({ format: "json", ...params }).toString()
  const res = await fetch(`${API}?${qs}`, {
    headers: { "User-Agent": "bulbapedia-mcp/1.0" },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new BulbapediaError(`Bulbapedia error ${res.status}`)
  return (await res.json()) as Raw
}

export interface SearchHit {
  title: string
  snippet: string
}

const stripTags = (s: string): string => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()

export async function searchArticles(query: string, limit = 5): Promise<SearchHit[]> {
  const data = await api({ action: "query", list: "search", srsearch: query, srlimit: String(limit) })
  const hits: Raw[] = data?.query?.search ?? []
  return hits.map((h) => ({ title: String(h.title), snippet: stripTags(String(h.snippet ?? "")) }))
}

export interface Article {
  title: string
  url?: string
  extract: string
}

export async function getArticle(title: string): Promise<Article | null> {
  const data = await api({
    action: "query",
    prop: "extracts|info",
    exintro: "1",
    explaintext: "1",
    inprop: "url",
    titles: title,
  })
  const pages: Raw = data?.query?.pages ?? {}
  const page: Raw | undefined = Object.values(pages)[0] as Raw | undefined
  if (!page || page.missing !== undefined) return null
  return {
    title: String(page.title ?? title),
    url: page.fullurl,
    extract: String(page.extract ?? "").trim() || "(no summary on this page)",
  }
}

export async function randomArticle(): Promise<{ title: string }> {
  const data = await api({ action: "query", list: "random", rnnamespace: "0", rnlimit: "1" })
  const hit = data?.query?.random?.[0]
  if (!hit) throw new BulbapediaError("Could not pick a random article")
  return { title: String(hit.title) }
}

export function formatArticle(a: Article): string {
  const out = [a.title, a.url ? `Wiki: ${a.url}` : "", "", a.extract].filter((l) => l !== "").join("\n")
  return out.length > 1800 ? out.slice(0, 1800) + "..." : out
}
