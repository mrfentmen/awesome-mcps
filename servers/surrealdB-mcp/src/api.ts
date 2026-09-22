/**
 * SurrealDB HTTP API client. Points at any instance via SURREALDB_URL
 * (default http://127.0.0.1:8000). Auth via SURREALDB_USER + SURREALDB_PASS
 * (root) or SURREALDB_TOKEN, plus SURREALDB_NS + SURREALDB_DB.
 * Docs: https://surrealdb.com/docs/surrealdb/integration/http
 */
const BASE = (process.env.SURREALDB_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "")

export class SurrealDbError extends Error {}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": "surrealdb-mcp/1.0",
    Accept: "application/json",
    "Surreal-NS": process.env.SURREALDB_NS ?? "test",
    "Surreal-DB": process.env.SURREALDB_DB ?? "test",
  }
  if (process.env.SURREALDB_TOKEN) {
    h.Authorization = `Bearer ${process.env.SURREALDB_TOKEN as string}`
  } else if (process.env.SURREALDB_USER && process.env.SURREALDB_PASS) {
    h.Authorization = `Basic ${Buffer.from(`${process.env.SURREALDB_USER}:${process.env.SURREALDB_PASS}`).toString("base64")}`
  } else {
    throw new SurrealDbError("Set SURREALDB_USER + SURREALDB_PASS (or SURREALDB_TOKEN).")
  }
  return h
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

export async function serverVersion(): Promise<string> {
  const res = await fetch(`${BASE}/version`, {
    headers: { "User-Agent": "surrealdb-mcp/1.0", Accept: "text/plain" },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new SurrealDbError(`SurrealDB at ${BASE} is unreachable (${res.status}). Set SURREALDB_URL.`)
  return (await res.text()).trim()
}

const READ_ONLY_RE = /^\s*(SELECT|RETURN|SHOW|DESCRIBE|INFO|COUNT|LET)\b/i

export async function runQuery(sql: string): Promise<Raw[]> {
  if (!sql.trim()) throw new SurrealDbError("Query is empty.")
  if (!READ_ONLY_RE.test(sql)) {
    throw new SurrealDbError("Only read queries (SELECT/RETURN/SHOW/DESCRIBE/INFO/COUNT/LET) are allowed through this tool.")
  }
  const res = await fetch(`${BASE}/sql`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/surql" },
    body: sql,
    signal: AbortSignal.timeout(30000),
  })
  if (res.status === 401 || res.status === 403) throw new SurrealDbError("SurrealDB refused auth (401/403). Check credentials.")
  if (!res.ok) {
    const msg = await res.text().catch(() => "")
    throw new SurrealDbError(`SurrealDB error ${res.status}: ${msg.slice(0, 200)}`)
  }
  const data = (await res.json()) as Raw[]
  return Array.isArray(data) ? data : [data]
}

export function formatResult(rows: Raw[]): string {
  if (rows.length === 0) return "Query returned no results."
  const out = rows.slice(0, 3).map((r) => JSON.stringify(r.result ?? r).slice(0, 600)).join("\n")
  return rows.length > 3 ? `${out}\n... (${rows.length} statements)` : out
}
