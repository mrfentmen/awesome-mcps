/**
 * Zitadel API v2 client. Points at any instance via ZITADEL_URL
 * (e.g. https://my-org.zitadel.cloud). Needs ZITADEL_TOKEN
 * (a service user PAT with user/org read permissions).
 * Docs: https://zitadel.com/docs/apis/introduction
 */
function base(): string {
  const url = (process.env.ZITADEL_URL ?? "").replace(/\/+$/, "")
  if (!url) throw new ZitadelError("Set ZITADEL_URL first (your instance, e.g. https://my-org.zitadel.cloud).")
  return url
}

export class ZitadelError extends Error {}

function headers(): Record<string, string> {
  const token = process.env.ZITADEL_TOKEN
  if (!token) throw new ZitadelError("Set ZITADEL_TOKEN first (service user personal access token).")
  return { "User-Agent": "zitadel-mcp/1.0", Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function postJson<T>(path: string, body: Raw = {}): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new ZitadelError("Zitadel refused (401/403). Check URL and token.")
  if (res.status === 404) throw new ZitadelError("Not found. Check ZITADEL_URL.")
  if (!res.ok) throw new ZitadelError(`Zitadel error ${res.status}`)
  return (await res.json()) as T
}

export interface ZitUser {
  id: string
  username?: string
  email?: string
  state?: string
}

export async function listUsers(limit = 10): Promise<ZitUser[]> {
  const data = await postJson<Raw>("/v2/users", { limit: Math.min(Math.max(limit, 1), 100) })
  const rows: Raw[] = Array.isArray(data.result) ? data.result : []
  return rows.slice(0, limit).map((u) => ({
    id: String(u.userId ?? "?"),
    username: u.username,
    email: u.human?.email?.email,
    state: u.state,
  }))
}

export interface ZitOrg {
  id: string
  name?: string
  state?: string
}

export async function listOrganizations(limit = 10): Promise<ZitOrg[]> {
  const data = await postJson<Raw>("/v2/organizations", { limit: Math.min(Math.max(limit, 1), 100) })
  const rows: Raw[] = Array.isArray(data.result) ? data.result : []
  return rows.slice(0, limit).map((o) => ({ id: String(o.organizationId ?? "?"), name: o.name, state: o.state }))
}

export function formatUser(u: ZitUser, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${u.id}] ${u.username ?? "(unnamed)"}${u.email ? ` <${u.email}>` : ""}${u.state ? ` [${u.state}]` : ""}`
}

export function formatOrg(o: ZitOrg, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${o.id}] ${o.name ?? "(unnamed)"}${o.state ? ` [${o.state}]` : ""}`
}
