const BASE = "https://api.semanticscholar.org/graph/v1"
const UA = "mrfentmen-semantic-scholar-mcp/1.0 (https://github.com/mrfentmen)"
export class ScholarError extends Error {}

async function get<T>(url: string, retries = 3): Promise<T> {
  let last: unknown = null
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
    if (res.status === 429) {
      last = new ScholarError("Semantic Scholar rate limit hit, wait and retry")
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)))
      continue
    }
    if (!res.ok) throw new ScholarError(`Semantic Scholar error ${res.status}`)
    return (await res.json()) as T
  }
  throw last instanceof Error ? last : new ScholarError("Semantic Scholar request failed")
}

export async function searchPapers(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new ScholarError("Provide search terms")
  const limit = Math.min(args.limit ?? 5, 15)
  const d = await get<any>(`${BASE}/paper/search?query=${encodeURIComponent(q)}&limit=${limit}&fields=title,year,authors,citationCount,externalIds`)
  const items = d?.data ?? []
  if (!items.length) return "No papers found"
  return items.map((p: any, i: number) => {
    const author = (p?.authors ?? []).slice(0, 3).map((a: any) => a.name).join(", ")
    return `${i + 1}. ${p.title ?? "Untitled"} (${p.year ?? "year n/a"})\n   ${author || "n/a"} | ${p.citationCount ?? 0} citations${p?.externalIds?.DOI ? ` | doi ${p.externalIds.DOI}` : ""}`
  }).join("\n\n")
}

export async function paperInfo(args: { paperId?: string }): Promise<string> {
  const id = (args.paperId ?? "").trim()
  if (!id) throw new ScholarError("Provide a paper ID")
  const d = await get<any>(`${BASE}/paper/${encodeURIComponent(id)}?fields=title,year,abstract,authors,citationCount,referenceCount,venue,externalIds`)
  return `Title: ${d.title ?? "n/a"} (${d.year ?? "year n/a"})\nVenue: ${d.venue ?? "n/a"}\nAuthors: ${(d.authors ?? []).slice(0, 5).map((a: any) => a.name).join(", ") || "n/a"}\nCitations: ${d.citationCount ?? 0} | References: ${d.referenceCount ?? 0}${d.externalIds?.DOI ? ` | doi ${d.externalIds.DOI}` : ""}\n\n${(d.abstract ?? "no abstract").slice(0, 500)}`
}
