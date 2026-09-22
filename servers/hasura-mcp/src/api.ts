/**
 * Hasura metadata/query API client. Points at any instance via HASURA_URL
 * (default http://localhost:8080). Admin calls need HASURA_ADMIN_SECRET.
 * Docs: https://hasura.io/docs/latest/api-reference/
 */
const BASE = (process.env.HASURA_URL ?? "http://localhost:8080").replace(/\/+$/, "")

export class HasuraError extends Error {}

function headers(): Record<string, string> {
  const h: Record<string, string> = { "User-Agent": "hasura-mcp/1.0", "Content-Type": "application/json", Accept: "application/json" }
  if (process.env.HASURA_ADMIN_SECRET) h["x-hasura-admin-secret"] = process.env.HASURA_ADMIN_SECRET as string
  return h
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function post<T>(path: string, body: Raw): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
  })
  if (res.status === 401 || res.status === 403) throw new HasuraError("Hasura refused (401/403). Set HASURA_ADMIN_SECRET.")
  if (res.status === 404) throw new HasuraError("Not found. Check HASURA_URL.")
  if (!res.ok) {
    const msg = await res.text().catch(() => "")
    throw new HasuraError(`Hasura error ${res.status}: ${msg.slice(0, 200)}`)
  }
  return (await res.json()) as T
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: headers(),
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new HasuraError("Hasura refused (401/403). Set HASURA_ADMIN_SECRET.")
  if (!res.ok) throw new HasuraError(`Hasura error ${res.status}`)
  return (await res.json()) as T
}

export async function exportMetadata(): Promise<Raw> {
  return await get<Raw>("/v1/metadata")
}

export async function runSql(sql: string, source = "default"): Promise<Raw> {
  if (!sql.trim()) throw new HasuraError("SQL is empty.")
  return await post<Raw>("/v2/query", { type: "run_sql", args: { source, sql } })
}

export function formatMetadata(md: Raw): string {
  const sources: Raw[] = Array.isArray(md.sources) ? md.sources : []
  const lines = sources.map((s) => {
    const tables: Raw[] = Array.isArray(s.tables) ? s.tables : []
    const names = tables.map((t) => String(t.table?.name ?? t.name ?? "?")).slice(0, 20)
    return `Source ${s.name ?? "?"} (${names.length} tables): ${names.join(", ")}`
  })
  return lines.length ? lines.join("\n") : "No sources in metadata."
}

export function formatSqlResult(r: Raw): string {
  if (Array.isArray(r.result)) {
    const rows = r.result as Raw[][]
    if (rows.length === 0) return "Query returned no rows."
    const head = rows[0].map(String).join(" | ")
    const body = rows.slice(1, 11).map((row) => row.map(String).join(" | ")).join("\n")
    const more = rows.length - 1 > 10 ? `\n... (${rows.length - 1} rows total)` : ""
    return `${head}\n${body}${more}`
  }
  return JSON.stringify(r).slice(0, 1500)
}
