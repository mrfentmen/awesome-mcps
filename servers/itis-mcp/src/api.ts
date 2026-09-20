/**
 * ITIS (Integrated Taxonomic Information System) JSON service client, keyless.
 * Docs: https://www.itis.gov/ws_description.html
 */
const BASE = "https://www.itis.gov/ITISWebService/jsonservice"

export class ItisError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "itis-mcp/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new ItisError(`ITIS error ${res.status}`)
  return (await res.json()) as T
}

export interface Taxon {
  tsn: string
  name: string
  author?: string
  kingdom?: string
  rank?: string
}

export async function searchScientific(name: string, limit = 5): Promise<Taxon[]> {
  const data = await getJson<Raw>(`/searchByScientificName?srchKey=${encodeURIComponent(name)}`)
  const rows: Raw[] = Array.isArray(data.scientificNames) ? data.scientificNames : []
  return rows.slice(0, limit).map((r) => ({
    tsn: String(r.tsn ?? "?"),
    name: String(r.combinedName ?? "?"),
    author: r.author,
  }))
}

export async function commonNames(tsn: string, limit = 10): Promise<string[]> {
  if (!/^\d+$/.test(tsn.trim())) throw new ItisError(`TSN must be numeric, got "${tsn}".`)
  const data = await getJson<Raw>(`/getCommonNamesFromTSN?tsn=${tsn.trim()}`)
  const rows: Raw[] = Array.isArray(data.commonNames) ? data.commonNames : []
  return rows.slice(0, limit).map((r) => String(r.commonName)).filter(Boolean)
}

export async function hierarchy(tsn: string): Promise<string[]> {
  if (!/^\d+$/.test(tsn.trim())) throw new ItisError(`TSN must be numeric, got "${tsn}".`)
  const data = await getJson<Raw>(`/getHierarchyDownFromTSN?tsn=${tsn.trim()}`)
  const rows: Raw[] = Array.isArray(data.hierarchyList) ? data.hierarchyList : []
  return rows.slice(0, 15).map((r) => `${String(r.rankName ?? "?")}: ${String(r.taxonName ?? "?")}`)
}

export function formatTaxon(t: Taxon, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${t.tsn}] ${t.name}${t.author ? ` ${t.author}` : ""}`
}
