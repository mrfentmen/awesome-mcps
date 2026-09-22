/**
 * Codewars API v1 client, keyless.
 * Docs: https://dev.codewars.com/
 */
const BASE = "https://www.codewars.com/api/v1"

export class CodewarsError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "codewars-mcp/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 404) throw new CodewarsError("Not found on Codewars.")
  if (!res.ok) throw new CodewarsError(`Codewars error ${res.status}`)
  return (await res.json()) as T
}

export interface Codewarrior {
  username: string
  honor?: number
  clan?: string
  leaderboard?: number
  overall?: string
  totalCompleted?: number
  languages: string[]
}

export async function getUser(username: string): Promise<Codewarrior> {
  if (!/^[\w-]+$/.test(username.trim())) throw new CodewarsError(`Not a username: "${username}".`)
  const u = await getJson<Raw>(`/users/${encodeURIComponent(username.trim())}`)
  const ranks = (u.ranks ?? {}) as Raw
  const overall = (ranks.overall ?? {}) as Raw
  const langs = (ranks.languages ?? {}) as Raw
  const completed = (u.codeChallenges ?? {}) as Raw
  return {
    username: String(u.username ?? username),
    honor: u.honor,
    clan: u.clan && u.clan !== "None" ? String(u.clan) : undefined,
    leaderboard: u.leaderboardPosition,
    overall: overall.name,
    totalCompleted: completed.totalCompleted,
    languages: Object.entries(langs)
      .map(([lang, r]) => `${lang}(${(r as Raw).name ?? "?"})`)
      .slice(0, 8),
  }
}

export interface Kata {
  id?: string
  name?: string
  rank?: string
  tags: string[]
}

export async function getKata(idOrSlug: string): Promise<Kata> {
  if (!/^[\w-]+$/.test(idOrSlug.trim())) throw new CodewarsError(`Not a kata id or slug: "${idOrSlug}".`)
  const k = await getJson<Raw>(`/code-challenges/${encodeURIComponent(idOrSlug.trim().toLowerCase())}`)
  return {
    id: k.id ?? k.slug,
    name: k.name,
    rank: (k.rank as Raw)?.name ?? k.rank,
    tags: Array.isArray(k.tags) ? k.tags.map(String).slice(0, 6) : [],
  }
}

export function formatUser(u: Codewarrior): string {
  const lines = [
    `${u.username}${u.overall ? ` (${u.overall})` : ""}`,
    u.honor !== undefined ? `Honor: ${u.honor.toLocaleString()}` : "",
    u.leaderboard ? `Leaderboard: #${u.leaderboard}` : "",
    u.clan ? `Clan: ${u.clan}` : "",
    u.totalCompleted !== undefined ? `Completed kata: ${u.totalCompleted}` : "",
    u.languages.length ? `Languages: ${u.languages.join(", ")}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}

export function formatKata(k: Kata): string {
  return `[${k.id ?? "?"}] ${k.name ?? "(unnamed)"}${k.rank ? ` (${k.rank})` : ""}${k.tags.length ? `\nTags: ${k.tags.join(", ")}` : ""}`
}
