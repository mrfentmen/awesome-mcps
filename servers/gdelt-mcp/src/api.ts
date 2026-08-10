const BASE = "https://api.gdeltproject.org/api/v2/doc/doc"
export class GdeltError extends Error {}

let lastRequest = 0

async function query(params: Record<string, string>): Promise<string> {
  const now = Date.now()
  const wait = 5000 - (now - lastRequest)
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastRequest = Date.now()
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}?${qs}`, { signal: AbortSignal.timeout(30000) })
  if (res.status === 429) throw new GdeltError("GDELT rate limit hit, wait a few seconds and retry")
  if (!res.ok) throw new GdeltError(`GDELT error ${res.status}`)
  const ct = res.headers.get("content-type") ?? ""
  if (ct.includes("json")) {
    const d = await res.json()
    const arts = d.articles ?? []
    return arts.map((a: any) => {
      const raw = String(a.seendate ?? "")
      const date = /^\d{14}$/.test(raw)
        ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
        : raw.slice(0, 10)
      return `${date} | ${a.language ?? ""} | ${a.domain ?? ""}\n  ${a.title ?? ""}\n  ${a.url ?? ""}`
    }).join("\n\n") || "No articles found"
  }
  throw new GdeltError("GDELT returned no JSON data for this query")
}

export async function searchNews(args: { query?: string; limit?: number; language?: string }): Promise<string> {
  const limit = Math.min(args.limit ?? 8, 25)
  const lang = args.language ? ` sourcelang:${args.language}` : ""
  return query({
    query: `${args.query ?? ""}${lang}`,
    mode: "artlist",
    maxrecords: String(limit),
    format: "json",
  })
}

export async function newsByCountry(args: { country?: string; limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 8, 25)
  return query({
    query: `${args.country ?? ""} sourcecountry:${(args.country ?? "").slice(0, 2).toUpperCase()}`,
    mode: "artlist",
    maxrecords: String(limit),
    format: "json",
  })
}
