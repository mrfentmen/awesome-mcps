/**
 * Rebrickable API v3 client. Needs REBRICKABLE_API_KEY
 * (free at https://rebrickable.com/api/).
 * Docs: https://rebrickable.com/downloads/
 */
const BASE = "https://rebrickable.com/api/v3"

export class RebrickableError extends Error {}

function apiKey(): string {
  const k = process.env.REBRICKABLE_API_KEY
  if (!k) throw new RebrickableError("Set REBRICKABLE_API_KEY first (free at rebrickable.com/api).")
  return k
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const sep = path.includes("?") ? "&" : "?"
  const res = await fetch(`${BASE}${path}${sep}key=${encodeURIComponent(apiKey())}`, {
    headers: { "User-Agent": "rebrickable-mcp/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new RebrickableError("Rebrickable refused (401/403). Check API key.")
  if (res.status === 404) throw new RebrickableError("Not found.")
  if (!res.ok) throw new RebrickableError(`Rebrickable error ${res.status}`)
  return (await res.json()) as T
}

export interface LegoSet {
  number: string
  name?: string
  year?: number
  parts?: number
  image?: string
}

export async function searchSets(query: string, limit = 5): Promise<LegoSet[]> {
  if (!query.trim()) throw new RebrickableError("Query is empty.")
  const data = await getJson<Raw>(`/sets/?search=${encodeURIComponent(query.trim())}&page_size=${Math.min(Math.max(limit, 1), 100)}`)
  const rows: Raw[] = Array.isArray(data.results) ? data.results : []
  return rows.slice(0, limit).map((s) => ({
    number: String(s.set_num),
    name: s.name,
    year: s.year,
    parts: s.num_parts,
    image: s.set_img_url,
  }))
}

export async function getSet(number: string): Promise<string> {
  const clean = number.trim()
  if (!/^[\w-]+$/.test(clean)) throw new RebrickableError(`Not a set number: "${number}". Try like "75192-1".`)
  const s = await getJson<Raw>(`/sets/${encodeURIComponent(clean)}/`)
  const lines = [
    `[${s.set_num ?? clean}] ${s.name ?? "(unnamed)"} (${s.year ?? "?"})`,
    `Parts: ${s.num_parts ?? "?"}`,
    s.set_img_url ? `${s.set_img_url}` : "",
    `More: https://rebrickable.com/sets/${s.set_num ?? clean}/`,
  ].filter(Boolean)
  return lines.join("\n")
}

export async function setParts(number: string, limit = 10): Promise<string[]> {
  const clean = number.trim()
  if (!/^[\w-]+$/.test(clean)) throw new RebrickableError(`Not a set number: "${number}".`)
  const data = await getJson<Raw>(`/sets/${encodeURIComponent(clean)}/parts/?page_size=${Math.min(Math.max(limit, 1), 100)}`)
  const rows: Raw[] = Array.isArray(data.results) ? data.results : []
  return rows.slice(0, limit).map((p) => {
    const part: Raw = p.part ?? {}
    return `${String(part.part_num ?? "?")} x${p.quantity ?? "?"} — ${String(part.name ?? "").slice(0, 80)} (${p.color?.name ?? "?"})`
  })
}

export function formatSet(s: LegoSet, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${s.number}] ${s.name ?? "(unnamed)"}${s.year ? ` (${s.year})` : ""}${s.parts !== undefined ? ` — ${s.parts} parts` : ""}${s.image ? `\n   ${s.image}` : ""}`
}
