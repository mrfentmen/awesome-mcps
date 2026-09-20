/**
 * Demozoo API v1 client, keyless.
 * Docs: https://demozoo.org/api/v1/ (browse the root URL for the endpoint list)
 */
const BASE = "https://demozoo.org/api/v1"

export class DemozooError extends Error {}

interface NickRef {
  name: string
  releaser?: { id: number; name: string; is_group: boolean }
}

export interface ProductionSummary {
  id: number
  title: string
  authors: string[]
  release_date?: string
  supertype?: string
  platforms: string[]
  types: string[]
  demozoo_url?: string
}

export interface ProductionDetails extends ProductionSummary {
  credits: string[]
  download_links: string[]
}

export interface Releaser {
  id: number
  name: string
  is_group: boolean
  nicks: string[]
  member_of: string[]
  members: string[]
  demozoo_url?: string
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "demozoo-mcp/1.0" },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new DemozooError(`Demozoo error ${res.status}`)
  return (await res.json()) as T
}

interface Paged<T> {
  count: number
  results: T[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

const names = (arr: unknown): string[] =>
  Array.isArray(arr) ? arr.map((x) => String((x as Raw)?.name ?? x)) : []

export function toSummary(p: Raw): ProductionSummary {
  return {
    id: p.id,
    title: String(p.title ?? "(untitled)"),
    authors: Array.isArray(p.author_nicks) ? p.author_nicks.map((n: NickRef) => n.name) : [],
    release_date: p.release_date,
    supertype: p.supertype,
    platforms: names(p.platforms),
    types: names(p.types),
    demozoo_url: p.demozoo_url,
  }
}

export async function searchProductions(query: string, limit = 5): Promise<ProductionSummary[]> {
  const data = await getJson<Paged<Raw>>(`/productions/?query=${encodeURIComponent(query)}`)
  return data.results.slice(0, limit).map(toSummary)
}

export async function getProduction(id: string): Promise<ProductionDetails | null> {
  if (!/^\d+$/.test(id.trim())) throw new DemozooError(`Production id must be numeric, got "${id}".`)
  const p = await getJson<Raw>(`/productions/${id.trim()}/`)
  if (!p || p.id === undefined) return null
  const s = toSummary(p)
  return {
    ...s,
    credits: Array.isArray(p.credits)
      ? p.credits.map((c: Raw) => `${c?.nick?.name ?? "?"} — ${c?.category ?? "?"}`).slice(0, 12)
      : [],
    download_links: Array.isArray(p.download_links)
      ? p.download_links.map((d: Raw) => String(d.url)).slice(0, 8)
      : [],
  }
}

export async function getReleaser(id: string): Promise<Releaser | null> {
  if (!/^\d+$/.test(id.trim())) throw new DemozooError(`Releaser id must be numeric, got "${id}".`)
  const r = await getJson<Raw>(`/releasers/${id.trim()}/`)
  if (!r || r.id === undefined) return null
  return {
    id: r.id,
    name: String(r.name ?? "?"),
    is_group: Boolean(r.is_group),
    nicks: Array.isArray(r.nicks) ? r.nicks.map((n: Raw) => String(n.name)) : [],
    member_of: Array.isArray(r.member_of) ? r.member_of.map((m: Raw) => String(m?.group?.name ?? "?")) : [],
    members: Array.isArray(r.members) ? r.members.map((m: Raw) => String(m?.nick?.name ?? "?")).slice(0, 15) : [],
    demozoo_url: r.demozoo_url,
  }
}

export function formatSummary(p: ProductionSummary, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  const by = p.authors.length ? ` by ${p.authors.slice(0, 3).join(", ")}` : ""
  const meta = [p.release_date, p.platforms.slice(0, 3).join("/"), p.types.slice(0, 2).join(", ")]
    .filter(Boolean)
    .join(" · ")
  return `${prefix}[${p.id}] ${p.title}${by}${meta ? ` (${meta})` : ""}`
}

export function formatProduction(p: ProductionDetails): string {
  const lines = [
    `[${p.id}] ${p.title}`,
    p.authors.length ? `By: ${p.authors.join(", ")}` : "",
    p.release_date ? `Released: ${p.release_date}` : "",
    p.platforms.length ? `Platforms: ${p.platforms.join(", ")}` : "",
    p.types.length ? `Type: ${p.types.join(", ")}` : "",
    p.credits.length ? `Credits:\n- ${p.credits.join("\n- ")}` : "",
    p.download_links.length ? `Downloads:\n- ${p.download_links.join("\n- ")}` : "",
    p.demozoo_url ? `More: ${p.demozoo_url}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}

export function formatReleaser(r: Releaser): string {
  const lines = [
    `[${r.id}] ${r.name} (${r.is_group ? "group" : "scener"})`,
    r.nicks.length > 1 ? `Nicks: ${r.nicks.join(", ")}` : "",
    r.member_of.length ? `Member of: ${r.member_of.join(", ")}` : "",
    r.members.length ? `Members: ${r.members.join(", ")}` : "",
    r.demozoo_url ? `More: ${r.demozoo_url}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}
