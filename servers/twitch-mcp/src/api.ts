/**
 * Twitch Helix API client. Needs TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET
 * (free at https://dev.twitch.tv/console). Uses client-credentials grant.
 * Docs: https://dev.twitch.tv/docs/api/
 */
export class TwitchError extends Error {}

let cached: { token: string; exp: number } | null = null

async function appToken(): Promise<string> {
  const id = process.env.TWITCH_CLIENT_ID
  const secret = process.env.TWITCH_CLIENT_SECRET
  if (!id || !secret) {
    throw new TwitchError("Set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET (free at dev.twitch.tv/console).")
  }
  if (cached && cached.exp > Date.now() + 60000) return cached.token
  const body = new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials" })
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "User-Agent": "twitch-mcp/1.0", "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new TwitchError(`Twitch OAuth failed (${res.status}). Check client id/secret.`)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await res.json()) as any
  if (!data.access_token) throw new TwitchError("Twitch OAuth returned no token.")
  cached = { token: data.access_token, exp: Date.now() + (data.expires_in ?? 3600) * 1000 }
  return cached.token
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function helix<T>(path: string): Promise<T> {
  const clientId = process.env.TWITCH_CLIENT_ID
  const res = await fetch(`https://api.twitch.tv/helix${path}`, {
    headers: { "User-Agent": "twitch-mcp/1.0", Accept: "application/json", "Client-Id": clientId ?? "", Authorization: `Bearer ${await appToken()}` },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new TwitchError("Twitch refused (401/403). Check credentials.")
  if (!res.ok) throw new TwitchError(`Twitch error ${res.status}`)
  return (await res.json()) as T
}

export interface Game {
  id: string
  name: string
}

export async function topGames(limit = 10): Promise<Game[]> {
  const data = await helix<{ data: Raw[] }>(`/games/top?first=${Math.min(Math.max(limit, 1), 100)}`)
  return (data.data ?? []).slice(0, limit).map((g) => ({ id: String(g.id), name: String(g.name) }))
}

export interface Stream {
  user: string
  game?: string
  title?: string
  viewers?: number
  language?: string
}

export async function topStreams(gameId = "", limit = 10): Promise<Stream[]> {
  const qs = new URLSearchParams({ first: String(Math.min(Math.max(limit, 1), 100)) })
  if (gameId.trim()) qs.set("game_id", gameId.trim())
  const data = await helix<{ data: Raw[] }>(`/streams?${qs}`)
  return (data.data ?? []).slice(0, limit).map((s) => ({
    user: String(s.user_name ?? s.user_login ?? "?"),
    game: s.game_name,
    title: s.title,
    viewers: s.viewer_count,
    language: s.language,
  }))
}

export interface TwitchUser {
  id: string
  login: string
  name?: string
  broadcasterType?: string
  description?: string
}

export async function getUser(login: string): Promise<TwitchUser | null> {
  if (!login.trim()) throw new TwitchError("Login is empty.")
  const data = await helix<{ data: Raw[] }>(`/users?login=${encodeURIComponent(login.trim())}`)
  const u = (data.data ?? [])[0]
  if (!u) return null
  return {
    id: String(u.id),
    login: String(u.login),
    name: u.display_name,
    broadcasterType: u.broadcaster_type || undefined,
    description: u.description ? String(u.description).slice(0, 200) : undefined,
  }
}

export function formatStream(s: Stream, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}${s.user}${s.game ? ` playing ${s.game}` : ""}${s.viewers !== undefined ? ` (${s.viewers.toLocaleString()} viewers)` : ""}${s.title ? `\n   ${s.title.slice(0, 120)}` : ""}`
}

export function formatUser(u: TwitchUser): string {
  return `[${u.id}] ${u.name ?? u.login} (@${u.login})${u.broadcasterType ? ` — ${u.broadcasterType}` : ""}${u.description ? `\n${u.description}` : ""}`
}
