/**
 * GreyNoise API v3 client. Needs GREYNOISE_API_KEY
 * (free community key at https://viz.greynoise.io/).
 * Docs: https://docs.greynoise.io/reference/
 */
const BASE = "https://api.greynoise.io/v3"

export class GreyNoiseError extends Error {}

function headers(): Record<string, string> {
  const key = process.env.GREYNOISE_API_KEY
  if (!key) throw new GreyNoiseError("Set GREYNOISE_API_KEY first (free at viz.greynoise.io).")
  return { "User-Agent": "greynoise-mcp/1.0", Accept: "application/json", key }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: headers(),
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new GreyNoiseError("GreyNoise refused (401/403). Check API key.")
  if (res.status === 404) throw new GreyNoiseError("IP not seen in GreyNoise noise data.")
  if (res.status === 429) throw new GreyNoiseError("GreyNoise quota hit (community tier is 50/week). Wait and retry.")
  if (!res.ok) throw new GreyNoiseError(`GreyNoise error ${res.status}`)
  return (await res.json()) as T
}

export async function checkIp(ip: string): Promise<string> {
  if (!ip.trim()) throw new GreyNoiseError("IP is empty.")
  const d = await getJson<Raw>(`/noise/context/${encodeURIComponent(ip.trim())}`)
  const tags: string[] = Array.isArray(d.tags) ? d.tags.map(String).slice(0, 8) : []
  const lines = [
    `${ip.trim()} — ${d.noise === true ? "INTERNET NOISE" : d.noise === false ? "not seen" : "?"}`,
    d.riot === true ? "Known benign service (RIOT)" : "",
    d.classification ? `Classification: ${d.classification}` : "",
    d.name ? `Actor: ${d.name}` : "",
    d.last_seen ? `Last seen: ${String(d.last_seen).slice(0, 10)}` : "",
    tags.length ? `Tags: ${tags.join(", ")}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}

export async function queryTags(query: string, limit = 5): Promise<string[]> {
  if (!query.trim()) throw new GreyNoiseError("Query is empty.")
  const qs = new URLSearchParams({ query: query.trim(), size: String(Math.min(Math.max(limit, 1), 50)) }).toString()
  const data = await getJson<Raw>(`/query?${qs}`)
  const rows: Raw[] = Array.isArray(data.data) ? data.data : []
  return rows.slice(0, limit).map((r) => `${String(r.ip ?? "?")} (${String(r.classification ?? "?")})`)
}
