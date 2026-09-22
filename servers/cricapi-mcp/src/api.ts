/**
 * CricAPI v1 client. Needs CRICAPI_API_KEY (free at https://cricapi.com/).
 * Docs: https://cricapi.com/api/
 */
const BASE = "https://api.cricapi.com/v1"

export class CricApiError extends Error {}

function apiKey(): string {
  const k = process.env.CRICAPI_API_KEY
  if (!k) throw new CricApiError("Set CRICAPI_API_KEY first (free at cricapi.com).")
  return k
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string, extra: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams({ ...extra, apikey: apiKey() }).toString()
  const res = await fetch(`${BASE}${path}?${qs}`, {
    headers: { "User-Agent": "cricapi-mcp/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new CricApiError("CricAPI refused (401/403). Check API key.")
  if (!res.ok) throw new CricApiError(`CricAPI error ${res.status}`)
  const data = (await res.json()) as Raw
  if (data.status === "failure") throw new CricApiError(`CricAPI: ${String(data.reason ?? "failed").slice(0, 160)}`)
  return data as T
}

export interface Match {
  id?: string
  name?: string
  status?: string
  date?: string
  venue?: string
  score?: string
}

export async function currentMatches(limit = 5): Promise<Match[]> {
  const data = await getJson<Raw>("/currentMatches", { offset: "0" })
  const rows: Raw[] = Array.isArray(data.data) ? data.data : []
  return rows.slice(0, limit).map(toMatch)
}

const toMatch = (m: Raw): Match => {
  const scores: Raw[] = Array.isArray(m.score) ? m.score : []
  const score = scores.map((s) => `${s.inning ?? ""} ${s.r ?? 0}/${s.w ?? 0}${s.o ? ` (${s.o} ov)` : ""}`).join(", ").trim();
  return {
    id: m.id,
    name: m.name,
    status: m.status,
    date: m.date ? String(m.date).slice(0, 10) : undefined,
    venue: m.venue,
    score: score || undefined,
  }
};

export async function matchInfo(id: string): Promise<Match> {
  if (!id.trim()) throw new CricApiError("Match id is empty.")
  const data = await getJson<Raw>(`/cricket/${encodeURIComponent(id.trim())}`)
  return toMatch((data.data ?? {}) as Raw)
}

export async function searchSeries(query: string, limit = 5): Promise<string[]> {
  if (!query.trim()) throw new CricApiError("Query is empty.")
  const data = await getJson<Raw>(`/series?search=${encodeURIComponent(query.trim())}&offset=0`)
  const rows: Raw[] = Array.isArray(data.data) ? data.data : []
  return rows.slice(0, limit).map((s) => `[${String(s.id ?? "?")}] ${String(s.name ?? "?")}${s.startDate ? ` (${String(s.startDate).slice(0, 10)})` : ""}`)
}

export function formatMatch(m: Match, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}${m.name ?? "(unnamed)"}${m.status ? ` [${m.status}]` : ""}${m.score ? `\n   ${m.score}` : ""}${m.date ? `\n   ${m.date}${m.venue ? ` at ${m.venue}` : ""}` : ""}`
}
