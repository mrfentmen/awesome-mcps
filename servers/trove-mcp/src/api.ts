/**
 * Trove (National Library of Australia) API v3 client. Needs TROVE_API_KEY
 * (free at https://trove.nla.gov.au/about/create-something/using-api).
 * Docs: https://trove.nla.gov.au/about/create-something/using-api
 */
const BASE = "https://api.trove.nla.gov.au/v3"

export class TroveError extends Error {}

function headers(): Record<string, string> {
  const key = process.env.TROVE_API_KEY
  if (!key) throw new TroveError("Set TROVE_API_KEY first (free at trove.nla.gov.au).")
  return { "User-Agent": "trove-mcp/1.0", Accept: "application/json", "X-API-KEY": key }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: headers(),
    signal: AbortSignal.timeout(25000),
  })
  if (res.status === 401 || res.status === 403) throw new TroveError("Trove refused (401/403). Check TROVE_API_KEY.")
  if (res.status === 404) throw new TroveError("Not found.")
  if (!res.ok) throw new TroveError(`Trove error ${res.status}`)
  return (await res.json()) as T
}

export interface TroveRecord {
  id?: string
  title?: string
  category?: string
  date?: string
  snippet?: string
}

export async function searchRecords(query: string, category = "all", limit = 5): Promise<TroveRecord[]> {
  if (!query.trim()) throw new TroveError("Query is empty.")
  const qs = new URLSearchParams({ q: query.trim(), limit: String(Math.min(Math.max(limit, 1), 100)) })
  if (category.trim() && category.trim() !== "all") qs.set("category", category.trim())
  const data = await getJson<Raw>(`/result?${qs}`)
  const cats: Raw[] = Array.isArray(data.category) ? data.category : []
  const out: TroveRecord[] = []
  for (const c of cats) {
    const rows: Raw[] = Array.isArray(c.records?.work) ? c.records.work : []
    for (const w of rows.slice(0, limit)) {
      out.push({
        id: w.id,
        title: w.title,
        category: c.name ?? c.code,
        date: w.issued ? String(w.issued).slice(0, 10) : undefined,
        snippet: w.snippet ? String(w.snippet).replace(/<[^>]+>/g, "").slice(0, 160) : undefined,
      })
      if (out.length >= limit) return out
    }
  }
  return out
}

export function formatRecord(r: TroveRecord, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${r.id ?? "?"}] ${r.title ?? "(untitled)"}${r.category ? ` (${r.category})` : ""}${r.date ? ` — ${r.date}` : ""}${r.snippet ? `\n   ${r.snippet}` : ""}`
}
