const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
const UA = "mrfentmen-pubmed-mcp/1.0 (https://github.com/mrfentmen)"
export class PubmedError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new PubmedError(`NCBI returned HTTP ${res.status}`)
  return (await res.json()) as T
}

interface Summary {
  title?: string
  source?: string
  pubdate?: string
  authors?: { name?: string }[]
  volume?: string
  issue?: string
  pages?: string
}

function fmtSummary(uid: string, s: Summary): string {
  const authors = (s.authors ?? []).slice(0, 3).map((a) => a.name ?? "").join(", ")
  const more = (s.authors ?? []).length > 3 ? ` et al.` : ""
  const loc = [s.volume, s.issue, s.pages].filter(Boolean).join(":")
  return `PMID ${uid} | ${s.source ?? "n/a"} ${pubyear(s.pubdate)}${loc ? ` ${loc}` : ""}\n   ${s.title ?? "no title"}\n   ${authors}${more}`
}

function pubyear(pubdate?: string): string {
  if (!pubdate) return ""
  const m = pubdate.match(/^\d{4}/)
  return m ? m[0] : pubdate.slice(0, 10)
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new PubmedError("Provide a search query")
  const limit = Math.min(args.limit ?? 10, 25)
  const d = await get<any>(`${EUTILS}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(q)}&retmode=json&retmax=${limit}`)
  const uids: string[] = d?.esearchresult?.idlist ?? []
  if (!uids.length) return "No PubMed results found"
  const e = await get<any>(`${EUTILS}/esummary.fcgi?db=pubmed&id=${uids.join(",")}&retmode=json`)
  const result = e?.result ?? {}
  return uids.map((uid) => fmtSummary(uid, result[uid] ?? {})).join("\n\n")
}

export async function article(args: { pmid?: string }): Promise<string> {
  const pmid = (args.pmid ?? "").trim()
  if (!/^\d+$/.test(pmid)) throw new PubmedError("Provide a numeric PubMed ID")
  const e = await get<any>(`${EUTILS}/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`)
  const result = e?.result ?? {}
  const s = result[pmid]
  if (!s) return `No article found for PMID ${pmid}`
  const authors = (s.authors ?? []).map((a: any) => a.name ?? "").filter(Boolean).join(", ")
  const lines = [
    `Title: ${s.title ?? "n/a"}`,
    `Journal: ${s.source ?? "n/a"}`,
    `Published: ${s.pubdate ?? "n/a"}`,
    `Citation: ${[s.volume, s.issue, s.pages].filter(Boolean).join(":") || "n/a"}`,
    `Authors: ${authors || "n/a"}`,
    s.abstract ? `\nAbstract:\n${s.abstract}` : "",
    s.fulljournalname ? `\nFull journal name: ${s.fulljournalname}` : "",
  ]
  return lines.filter((l) => l !== "" && l !== undefined).join("\n")
}
