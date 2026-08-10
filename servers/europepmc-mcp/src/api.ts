const BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest"
const UA = "mrfentmen-europepmc-mcp/1.0 (https://github.com/mrfentmen)"
export class EuropepmcError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new EuropepmcError(`Europe PMC returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new EuropepmcError("Provide a search query")
  const limit = Math.min(args.limit ?? 10, 20)
  const d = await get<any>(`${BASE}/search?query=${encodeURIComponent(q)}&format=json&pageSize=${limit}`)
  const results = d?.resultList?.result ?? []
  if (!results.length) return `No articles found for \"${q}\"`
  return `Europe PMC results for \"${q}\" (${d?.hitCount ?? results.length} total):\n` + results.map((a: any, i: number) => {
    const journal = a?.journalInfo?.journal?.title ?? ""
    const open = a?.isOpenAccess ? " [open access]" : ""
    return `${i + 1}. [${a?.source ?? ""}:${a?.id ?? ""}] ${a?.title ?? "n/a"}\n   ${a?.authorString?.slice(0, 100) ?? ""} | ${a?.pubYear ?? ""}${journal ? ` | ${journal}` : ""}${open}`
  }).join("\n")
}

export async function article(args: { extId?: string; source?: string }): Promise<string> {
  const extId = (args.extId ?? "").trim()
  if (!extId) throw new EuropepmcError("Provide an article ID")
  const source = (args.source ?? "MED").trim().toUpperCase()
  const a = await get<any>(`${BASE}/search?query=EXT_ID:${encodeURIComponent(extId)}%20AND%20SRC:${encodeURIComponent(source)}&format=json&resultType=core&pageSize=1`)
  const r = a?.resultList?.result?.[0]
  if (!r) throw new EuropepmcError(`Article not found: ${extId} (${source})`)
  const journal = r?.journalInfo?.journal?.title ?? ""
  const lines = [
    `Title: ${r?.title ?? "n/a"}`,
    `Authors: ${r?.authorString ?? "n/a"}`,
    `Journal: ${journal}${r?.journalInfo?.issue?.publicationDate ? ` | ${r.journalInfo.issue.publicationDate}` : ""}`,
    `Source: ${r?.source ?? ""}:${r?.id ?? ""}`,
  ]
  if (r?.abstractText) lines.push(`\nAbstract:\n${r.abstractText.slice(0, 700)}`)
  if (r?.doi) lines.push(`\nDOI: ${r.doi}`)
  return lines.join("\n")
}
