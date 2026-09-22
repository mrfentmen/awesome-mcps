/**
 * Fauna query API client (FQL v10). Points at Fauna Cloud by default via
 * FAUNA_URL, or any self-hosted/local endpoint. Needs FAUNA_SECRET.
 * Docs: https://docs.fauna.com/fauna/current/api/
 */
const BASE = (process.env.FAUNA_URL ?? "https://db.fauna.com").replace(/\/+$/, "")

export class FaunaError extends Error {}

function headers(): Record<string, string> {
  const secret = process.env.FAUNA_SECRET
  if (!secret) throw new FaunaError("Set FAUNA_SECRET first (a database secret).")
  return {
    "User-Agent": "fauna-mcp/1.0",
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${secret}`,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function query<T>(fql: string): Promise<T> {
  if (!fql.trim()) throw new FaunaError("Query is empty.")
  const res = await fetch(`${BASE}/query/1`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ query: fql }),
    signal: AbortSignal.timeout(30000),
  })
  if (res.status === 401 || res.status === 403) throw new FaunaError("Fauna refused (401/403). Check FAUNA_SECRET.")
  if (!res.ok) {
    const msg = await res.text().catch(() => "")
    throw new FaunaError(`Fauna error ${res.status}: ${msg.slice(0, 200)}`)
  }
  return (await res.json()) as T
}

export async function listCollections(): Promise<string[]> {
  const data = await query<Raw>("Collection.all().map(c => c.name)")
  const rows: Raw = data.data ?? data
  const names: string[] = Array.isArray(rows?.data) ? rows.data : Array.isArray(rows) ? rows : []
  return names.map(String).slice(0, 50)
}

export async function runQuery(fql: string): Promise<string> {
  const data = await query<Raw>(fql)
  const payload = ("data" in data ? data.data : data) as unknown
  return JSON.stringify(payload, null, 2).slice(0, 2000)
}
