const BASE = "https://api.datacite.org/dois"
const UA = "mrfentmen-datacite-mcp/1.0 (https://github.com/mrfentmen)"
export class DataciteError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/vnd.api+json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new DataciteError(`DataCite returned HTTP ${res.status}`)
  return (await res.json()) as T
}

function fmtDoi(rec: any, i: number): string {
  const a = rec?.attributes ?? {}
  const title = a?.titles?.[0]?.title ?? "untitled"
  const creator = a?.creators?.[0]?.name ?? "unknown"
  const year = a?.publicationYear ?? ""
  const type = a?.types?.resourceTypeGeneral ?? a?.types?.resourceType ?? ""
  return `${i + 1}. ${title}\n   ${creator} | ${year}${type ? ` | ${type}` : ""} | ${rec?.id ?? ""}`
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new DataciteError("Provide a search query")
  const limit = Math.min(args.limit ?? 10, 20)
  const d = await get<any>(`${BASE}?query=${encodeURIComponent(q)}&page[size]=${limit}`)
  const list = (d?.data ?? []) as any[]
  if (!list.length) return `No DOIs found for \"${q}\"`
  return `DataCite results for \"${q}\" (${d?.meta?.total ?? list.length} total):\n` + list.map(fmtDoi).join("\n")
}

export async function doi(args: { doi?: string }): Promise<string> {
  const doi = (args.doi ?? "").trim()
  if (!doi) throw new DataciteError("Provide a DOI like 10.5281/zenodo.20501604")
  const d = await get<any>(`${BASE}/${encodeURIComponent(doi)}`)
  const rec = d?.data
  if (!rec) throw new DataciteError(`DOI not found: ${doi}`)
  const a = rec?.attributes ?? {}
  const lines = [
    `DOI: ${rec?.id ?? doi}`,
    `Title: ${a?.titles?.[0]?.title ?? "n/a"}`,
    `Creators: ${(a?.creators ?? []).slice(0, 5).map((c: any) => c?.name).filter(Boolean).join(", ") || "n/a"}`,
    `Publisher: ${a?.publisher ?? "n/a"}`,
    `Published: ${a?.publicationYear ?? "n/a"}`,
    `Type: ${a?.types?.resourceTypeGeneral ?? "n/a"}`,
  ]
  if (a?.descriptions?.length) lines.push(`\nDescription: ${String(a.descriptions[0]?.description ?? "").slice(0, 400)}`)
  if (a?.url) lines.push(`\nURL: ${a.url}`)
  return lines.join("\n")
}
