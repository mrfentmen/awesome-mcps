/**
 * Reactome ContentService client, keyless.
 * Docs: https://reactome.org/dev/content-service
 */
const BASE = "https://reactome.org/ContentService"

export class ReactomeError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "reactome-mcp/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 404) throw new ReactomeError("Not found in Reactome.")
  if (!res.ok) throw new ReactomeError(`Reactome error ${res.status}`)
  return (await res.json()) as T
}

const clean = (s: unknown, max: number): string | undefined => {
  if (typeof s !== "string" || !s) return undefined
  const t = s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
  return t ? (t.length > max ? t.slice(0, max) + "..." : t) : undefined
}

export interface PathwayHit {
  stId: string
  name: string
  type?: string
  species: string[]
  summary?: string
}

export async function searchPathways(query: string, limit = 5): Promise<PathwayHit[]> {
  const data = await getJson<Raw>(`/search/query?query=${encodeURIComponent(query)}`)
  const hits: Raw[] = [];
  for (const r of data.results ?? []) for (const e of r.entries ?? []) hits.push(e)
  return hits.slice(0, limit).map((e) => ({
    stId: String(e.stId ?? e.id ?? "?"),
    name: clean(e.name, 120) ?? "?",
    type: e.exactType || e.type,
    species: Array.isArray(e.species) ? e.species.map(String) : [],
    summary: clean(e.summation, 220),
  }))
}

export interface PathwayDetails {
  stId: string
  name?: string
  species?: string
  summary?: string
  compartments: string[]
  literature: string[]
}

export async function getPathway(stId: string): Promise<PathwayDetails | null> {
  const cleanId = stId.trim().toUpperCase()
  if (!/^R-[A-Z]{3}-\d+/.test(cleanId)) {
    throw new ReactomeError(`Not a Reactome stable id: "${stId}". Use search_pathways to find one (e.g. R-HSA-109581).`)
  }
  const p = await getJson<Raw>(`/data/query/enhanced/${cleanId}`)
  if (!p || p.stId === undefined) return null
  const comps: Raw[] = Array.isArray(p.compartment) ? p.compartment : p.compartment ? [p.compartment] : []
  const lit: Raw = p.literatureReference ?? {}
  const refs: Raw[] = Array.isArray(lit) ? lit : lit.references ?? []
  return {
    stId: String(p.stId ?? cleanId),
    name: clean(p.displayName ?? p.name, 140),
    species: p.speciesName ? String(p.speciesName) : undefined,
    summary: clean(p.summation, 600),
    compartments: comps.map((c) => String(c.displayName ?? c.name ?? c)).slice(0, 8),
    literature: refs.map((r) => String(r.displayName ?? r.title ?? r)).slice(0, 5),
  }
}

export function formatHit(h: PathwayHit, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  const sp = h.species.length ? ` [${h.species.slice(0, 2).join(", ")}]` : ""
  return `${prefix}[${h.stId}] ${h.name}${h.type ? ` (${h.type})` : ""}${sp}${h.summary ? `\n   ${h.summary}` : ""}`
}

export function formatPathway(p: PathwayDetails): string {
  const lines = [
    `[${p.stId}] ${p.name ?? "(unnamed)"}`,
    p.species ? `Species: ${p.species}` : "",
    p.summary ? `Summary: ${p.summary}` : "",
    p.compartments.length ? `Compartments: ${p.compartments.join(", ")}` : "",
    p.literature.length ? `Literature:\n- ${p.literature.join("\n- ")}` : "",
    `Diagram: https://reactome.org/PathwayBrowser/#/${p.stId}`,
  ].filter(Boolean)
  return lines.join("\n")
}
