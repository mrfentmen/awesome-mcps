/**
 * AlienVault OTX API v2 client. Needs OTX_API_KEY
 * (free at https://otx.alienvault.com/, Settings > API Integration).
 * Docs: https://otx.alienvault.com/api
 */
const BASE = "https://otx.alienvault.com/api/v1"

export class OtxError extends Error {}

function headers(): Record<string, string> {
  const key = process.env.OTX_API_KEY
  if (!key) throw new OtxError("Set OTX_API_KEY first (free at otx.alienvault.com, Settings).")
  return { "User-Agent": "otx-mcp/1.0", Accept: "application/json", "X-OTX-API-KEY": key }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: headers(),
    signal: AbortSignal.timeout(25000),
  })
  if (res.status === 401 || res.status === 403) throw new OtxError("OTX refused (401/403). Check API key.")
  if (res.status === 404) throw new OtxError("Not found.")
  if (!res.ok) throw new OtxError(`OTX error ${res.status}`)
  return (await res.json()) as T
}

export interface Pulse {
  id?: string
  name?: string
  author?: string
  indicators?: number
  modified?: string
}

export async function searchPulses(query: string, limit = 5): Promise<Pulse[]> {
  if (!query.trim()) throw new OtxError("Query is empty.")
  const data = await getJson<Raw>(`/search/pulses/?q=${encodeURIComponent(query.trim())}&limit=${Math.min(Math.max(limit, 1), 50)}`)
  const rows: Raw[] = Array.isArray(data.results) ? data.results : []
  return rows.slice(0, limit).map((p) => ({
    id: p.id,
    name: p.name,
    author: p.author_name,
    indicators: typeof p.indicator_count === "number" ? p.indicator_count : undefined,
    modified: p.modified ? String(p.modified).slice(0, 10) : undefined,
  }))
}

export async function pulseIndicators(id: string, limit = 10): Promise<string[]> {
  if (!id.trim()) throw new OtxError("Pulse id is empty.")
  const data = await getJson<Raw>(`/pulses/${encodeURIComponent(id.trim())}/indicators?limit=${Math.min(Math.max(limit, 1), 100)}`)
  const rows: Raw[] = Array.isArray(data.results) ? data.results : []
  return rows.slice(0, limit).map((i) => `${String(i.indicator ?? "?")} [${String(i.type ?? "?")}]`)
}

export async function ipReputation(ip: string): Promise<string> {
  if (!ip.trim()) throw new OtxError("IP is empty.")
  const data = await getJson<Raw>(`/indicators/IPv4/${encodeURIComponent(ip.trim())}/general`)
  const lines = [
    `${ip.trim()}`,
    data.reputation !== undefined ? `Reputation: ${data.reputation}` : "",
    data.country_code ? `Country: ${data.country_code}${data.asn ? ` (${data.asn})` : ""}` : "",
    Array.isArray(data.pulse_info?.pulses) && data.pulse_info.pulses.length
      ? `In ${data.pulse_info.pulses.length} pulses, e.g. ${data.pulse_info.pulses.slice(0, 3).map((p: Raw) => String(p.name ?? p.id)).join("; ")}`
      : "In no pulses",
  ].filter(Boolean)
  return lines.join("\n")
}

export function formatPulse(p: Pulse, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${p.id ?? "?"}] ${p.name ?? "(unnamed)"}${p.author ? ` by ${p.author}` : ""}${p.indicators !== undefined ? ` (${p.indicators} indicators)` : ""}${p.modified ? ` — ${p.modified}` : ""}`
}
