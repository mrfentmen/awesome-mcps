/**
 * Logto Management API client. Needs LOGTO_URL (tenant, e.g.
 * https://abc123.logto.app or self-hosted) plus LOGTO_M2M_ID +
 * LOGTO_M2M_SECRET (machine-to-machine app with Management API access).
 * Uses client-credentials grant; token cached in memory.
 * Docs: https://docs.logto.io/integrate-logto/
 */
function base(): string {
  const url = (process.env.LOGTO_URL ?? "").replace(/\/+$/, "")
  if (!url) throw new LogtoError("Set LOGTO_URL first (your tenant URL).")
  return url
}

export class LogtoError extends Error {}

let cached: { token: string; exp: number } | null = null

async function appToken(): Promise<string> {
  const id = process.env.LOGTO_M2M_ID
  const secret = process.env.LOGTO_M2M_SECRET
  if (!id || !secret) {
    throw new LogtoError("Set LOGTO_M2M_ID and LOGTO_M2M_SECRET (machine-to-machine app).")
  }
  if (cached && cached.exp > Date.now() + 60000) return cached.token
  const body = new URLSearchParams({ grant_type: "client_credentials", resource: "https://default.logto.app/api", scope: "all" })
  const res = await fetch(`${base()}/oidc/token`, {
    method: "POST",
    headers: {
      "User-Agent": "logto-mcp/1.0",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new LogtoError(`Logto OAuth failed (${res.status}). Check tenant URL and M2M credentials.`)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await res.json()) as any
  if (!data.access_token) throw new LogtoError("Logto OAuth returned no token.")
  cached = { token: data.access_token, exp: Date.now() + (data.expires_in ?? 3600) * 1000 }
  return cached.token
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    headers: { "User-Agent": "logto-mcp/1.0", Accept: "application/json", Authorization: `Bearer ${await appToken()}` },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) {
    cached = null
    throw new LogtoError("Logto refused (401/403). Check M2M credentials and API access.")
  }
  if (res.status === 404) throw new LogtoError("Not found.")
  if (!res.ok) throw new LogtoError(`Logto error ${res.status}`)
  return (await res.json()) as T
}

export interface LogtoUser {
  id: string
  username?: string
  email?: string
  created?: string
}

export async function listUsers(limit = 10): Promise<LogtoUser[]> {
  const rows = await getJson<Raw[]>(`/api/users?page=1&page_size=${Math.min(Math.max(limit, 1), 100)}`)
  return (Array.isArray(rows) ? rows : []).slice(0, limit).map((u) => ({
    id: String(u.id),
    username: u.username,
    email: u.primaryEmail,
    created: u.createdAt ? String(u.createdAt).slice(0, 10) : undefined,
  }))
}

export interface LogtoApp {
  id: string
  name?: string
  type?: string
}

export async function listApplications(limit = 10): Promise<LogtoApp[]> {
  const rows = await getJson<Raw[]>(`/api/applications?page=1&page_size=${Math.min(Math.max(limit, 1), 100)}`)
  return (Array.isArray(rows) ? rows : []).slice(0, limit).map((a) => ({
    id: String(a.id),
    name: a.name,
    type: a.type,
  }))
}
