const BASE = "https://api.crossref.org"
const UA = "mrfentmen-crossref-mcp/1.0 (https://github.com/mrfentmen)"
export class CrossrefError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new CrossrefError("Crossref rate limit hit, wait and retry")
  if (!res.ok) throw new CrossrefError(`Crossref error ${res.status}`)
  return (await res.json()) as T
}

function fmtWork(w: any, i: number): string {
  const authors = (w?.author ?? []).slice(0, 3).map((a: any) => `${a.given ?? ""} ${a.family ?? ""}`.trim()).join(", ")
  const year = w?.issued?.["date-parts"]?.[0]?.[0] ?? "year n/a"
  return `${i + 1}. ${w?.title?.[0] ?? "Untitled"} (${year})\n   ${authors || "n/a"} | ${w?.type ?? ""}${w?.DOI ? ` | doi ${w.DOI}` : ""}`
}

export async function searchWorks(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new CrossrefError("Provide search terms")
  const limit = Math.min(args.limit ?? 5, 15)
  const d = await get<any>(`${BASE}/works?query=${encodeURIComponent(q)}&rows=${limit}`)
  const items = d?.message?.items ?? []
  if (!items.length) return "No works found"
  return items.map(fmtWork).join("\n\n")
}

export async function doiLookup(args: { doi?: string }): Promise<string> {
  const doi = (args.doi ?? "").trim()
  if (!doi) throw new CrossrefError("Provide a DOI")
  const d = await get<any>(`${BASE}/works/${encodeURIComponent(doi)}`)
  const w = d?.message ?? {}
  return `Title: ${w?.title?.[0] ?? "n/a"}\nType: ${w?.type ?? "n/a"}\nPublisher: ${w?.publisher ?? "n/a"}\nYear: ${w?.issued?.["date-parts"]?.[0]?.[0] ?? "n/a"}\nAuthors: ${(w?.author ?? []).slice(0, 5).map((a: any) => `${a.given ?? ""} ${a.family ?? ""}`.trim()).join(", ") || "n/a"}\nDOI: ${w?.DOI ?? doi}\nURL: https://doi.org/${w?.DOI ?? doi}`
}
