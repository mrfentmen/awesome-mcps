/**
 * Milvus REST API v2 client. Points at any instance via MILVUS_URL
 * (default http://localhost:19530). Optional MILVUS_TOKEN (Bearer).
 * Docs: https://milvus.io/api-reference/restful/
 */
const BASE = (process.env.MILVUS_URL ?? "http://localhost:19530").replace(/\/+$/, "")

export class MilvusError extends Error {}

function headers(): Record<string, string> {
  const h: Record<string, string> = { "User-Agent": "milvus-mcp/1.0", Accept: "application/json", "Content-Type": "application/json" }
  if (process.env.MILVUS_TOKEN) h.Authorization = `Bearer ${process.env.MILVUS_TOKEN as string}`
  return h
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function postJson<T>(path: string, body: Raw = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
  })
  if (res.status === 401 || res.status === 403) throw new MilvusError("Milvus refused (401/403). Check MILVUS_TOKEN.")
  if (res.status === 404) throw new MilvusError("Not found. Check MILVUS_URL.")
  if (!res.ok) {
    const msg = await res.text().catch(() => "")
    throw new MilvusError(`Milvus error ${res.status}: ${msg.slice(0, 200)}`)
  }
  return (await res.json()) as T
}

function checkCode(data: Raw, what: string): void {
  if (typeof data.code === "number" && data.code !== 0 && data.code !== 200) {
    throw new MilvusError(`${what} failed: ${String(data.message ?? data.code)}`)
  }
}

export async function listCollections(): Promise<string[]> {
  const data = await postJson<Raw>("/v2/vectordb/collections/list", {})
  checkCode(data, "List collections")
  const rows: Raw[] = Array.isArray(data.data) ? data.data : []
  return rows.map(String)
}

export async function describeCollection(name: string): Promise<Raw> {
  if (!name.trim()) throw new MilvusError("Collection name is empty.")
  const data = await postJson<Raw>("/v2/vectordb/collections/describe", { collectionName: name.trim() })
  checkCode(data, "Describe collection")
  return (data.data ?? {}) as Raw
}

export async function collectionStats(name: string): Promise<Raw> {
  if (!name.trim()) throw new MilvusError("Collection name is empty.")
  const data = await postJson<Raw>("/v2/vectordb/collections/get_stats", { collectionName: name.trim() })
  checkCode(data, "Collection stats")
  return (data.data ?? {}) as Raw
}

export function formatDescribe(name: string, d: Raw): string {
  const fields: Raw[] = Array.isArray(d.fields) ? d.fields : []
  const lines = [
    `Collection ${name}`,
    d.description ? `${d.description}` : "",
    `Fields: ${fields.map((f) => `${String(f.name)}:${String(f.dataType ?? "?")}`).join(", ") || "(none)"}`,
    d.dimension !== undefined ? `Dimension: ${d.dimension}` : "",
    d.metricType ? `Metric: ${d.metricType}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}

export function formatStats(name: string, d: Raw): string {
  return `Collection ${name}: ${d.row_count ?? "?"} rows${d.indexed ? " (indexed)" : ""}`
}
