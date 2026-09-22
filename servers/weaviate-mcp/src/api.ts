/**
 * Weaviate REST + GraphQL client. Points at any instance via WEAVIATE_URL
 * (default http://localhost:8080). Optional WEAVIATE_API_KEY (Bearer).
 * Docs: https://weaviate.io/developers/weaviate/api/rest
 */
const BASE = (process.env.WEAVIATE_URL ?? "http://localhost:8080").replace(/\/+$/, "")

export class WeaviateError extends Error {}

function headers(): Record<string, string> {
  const h: Record<string, string> = { "User-Agent": "weaviate-mcp/1.0", Accept: "application/json" }
  if (process.env.WEAVIATE_API_KEY) h.Authorization = `Bearer ${process.env.WEAVIATE_API_KEY as string}`
  return h
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: headers(),
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new WeaviateError("Weaviate refused (401/403). Check WEAVIATE_API_KEY.")
  if (res.status === 404) throw new WeaviateError("Not found. Check WEAVIATE_URL and the class name.")
  if (!res.ok) throw new WeaviateError(`Weaviate error ${res.status}`)
  return (await res.json()) as T
}

async function postJson<T>(path: string, body: Raw): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  })
  if (res.status === 401 || res.status === 403) throw new WeaviateError("Weaviate refused (401/403). Check WEAVIATE_API_KEY.")
  if (!res.ok) {
    const msg = await res.text().catch(() => "")
    throw new WeaviateError(`Weaviate error ${res.status}: ${msg.slice(0, 200)}`)
  }
  return (await res.json()) as T
}

export interface WvClass {
  name: string
  properties: string[]
}

export async function listClasses(): Promise<WvClass[]> {
  const data = await getJson<Raw>("/v1/schema")
  const rows: Raw[] = Array.isArray(data.classes) ? data.classes : []
  return rows.map((c) => ({
    name: String(c.class ?? "?"),
    properties: (Array.isArray(c.properties) ? c.properties : []).map((p: Raw) => String(p.name)).slice(0, 12),
  }))
}

export async function listObjects(className: string, limit = 5): Promise<Raw[]> {
  const data = await getJson<Raw>(`/v1/objects?class=${encodeURIComponent(className)}&limit=${Math.min(Math.max(limit, 1), 100)}`)
  const rows: Raw[] = Array.isArray(data.objects) ? data.objects : []
  return rows.slice(0, limit)
}

export async function graphqlQuery(query: string): Promise<Raw> {
  if (!query.trim()) throw new WeaviateError("Query is empty.")
  const low = query.trim().toLowerCase()
  if (/^\s*(mutation|delete)\b/.test(low)) {
    throw new WeaviateError("Only Get {} queries are allowed through this tool.")
  }
  return await postJson<Raw>("/v1/graphql", { query })
}

export function formatObject(o: Raw, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  const props = o.properties && typeof o.properties === "object" ? o.properties as Raw : {}
  const shown = Object.entries(props).slice(0, 6).map(([k, v]) => `${k}: ${JSON.stringify(v)?.slice(0, 80)}`).join(", ")
  return `${prefix}[${String(o.id ?? "?")}] ${shown}`
}
