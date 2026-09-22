/**
 * Jellyfin REST API client. Points at any instance via JELLYFIN_URL
 * (default http://localhost:8096). Public info needs no key; user and
 * library calls need JELLYFIN_API_KEY (Dashboard > API Keys).
 * Docs: https://api.jellyfin.org/
 */
const BASE = (process.env.JELLYFIN_URL ?? "http://localhost:8096").replace(/\/+$/, "")

export class JellyfinError extends Error {}

function apiKey(): string | null {
  return process.env.JELLYFIN_API_KEY ?? null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string, authed: boolean): Promise<T> {
  const headers: Record<string, string> = { "User-Agent": "jellyfin-mcp/1.0", Accept: "application/json" }
  if (authed) {
    const key = apiKey()
    if (!key) throw new JellyfinError("Set JELLYFIN_API_KEY first (Dashboard > API Keys on your server).")
    headers["X-Emby-Token"] = key
  }
  const res = await fetch(`${BASE}${path}`, {
    headers,
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new JellyfinError("Jellyfin refused the key (401/403). Check JELLYFIN_API_KEY.")
  if (res.status === 404) throw new JellyfinError("Not found.")
  if (!res.ok) throw new JellyfinError(`Jellyfin error ${res.status}`)
  return (await res.json()) as T
}

export interface ServerInfo {
  name?: string
  version?: string
  id?: string
}

export async function serverInfo(): Promise<ServerInfo> {
  const info = await getJson<Raw>("/System/Info/Public", false)
  return { name: info.ServerName, version: info.Version, id: info.Id }
}

export interface JellyUser {
  id: string
  name?: string
  admin?: boolean
  lastActive?: string
}

export async function listUsers(): Promise<JellyUser[]> {
  const rows = await getJson<Raw[]>("/Users", true)
  return rows.map((u) => ({
    id: String(u.Id),
    name: u.Name,
    admin: u.Policy?.IsAdministrator,
    lastActive: u.LastActivityDate ? String(u.LastActivityDate).slice(0, 10) : undefined,
  }))
}

export interface Library {
  id: string
  name?: string
  type?: string
}

export async function listLibraries(): Promise<Library[]> {
  const data = await getJson<Raw>("/Library/MediaFolders", true)
  const rows: Raw[] = Array.isArray(data.Items) ? data.Items : []
  return rows.map((l) => ({ id: String(l.Id), name: l.Name, type: l.CollectionType }))
}

export function formatUser(u: JellyUser, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${u.id}] ${u.name ?? "(unnamed)"}${u.admin ? " (admin)" : ""}${u.lastActive ? ` — active ${u.lastActive}` : ""}`
}

export function formatLibrary(l: Library, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${l.id}] ${l.name ?? "(unnamed)"}${l.type ? ` (${l.type})` : ""}`
}
