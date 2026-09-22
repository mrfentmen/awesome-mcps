/**
 * RetroAchievements API client. Needs RA_USERNAME + RA_API_KEY
 * (free at https://retroachievements.org/settings, "API key" section).
 * Docs: https://api-docs.retroachievements.org/
 */
const BASE = "https://retroachievements.org/API"

export class RaError extends Error {}

function auth(): { z: string; y: string } {
  const user = process.env.RA_USERNAME
  const key = process.env.RA_API_KEY
  if (!user || !key) throw new RaError("Set RA_USERNAME and RA_API_KEY first (free at retroachievements.org/settings).")
  return { z: user, y: key }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string, extra: Record<string, string> = {}): Promise<T> {
  const { z, y } = auth()
  const qs = new URLSearchParams({ z, y, ...extra }).toString()
  const res = await fetch(`${BASE}${path}?${qs}`, {
    headers: { "User-Agent": "retrogachievements-mcp/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new RaError("RetroAchievements refused (401/403). Check username and key.")
  if (res.status === 404) throw new RaError("Not found.")
  if (!res.ok) throw new RaError(`RetroAchievements error ${res.status}`)
  return (await res.json()) as T
}

export async function gameExtended(gameId: string): Promise<string> {
  if (!/^\d+$/.test(gameId.trim())) {
    throw new RaError(`Game id must be numeric, got "${gameId}". Find ids via rom-mcp or hiddenpalace-mcp.`)
  }
  const data = await getJson<Raw>("/API_GetGameExtended.php", { i: gameId.trim() })
  const ach: Raw = data.Achievements ?? {}
  const list: Raw[] = Object.values(ach)
  const shown = list.slice(0, 8).map((a) => `${String(a.Title ?? "?")} (${a.Points ?? "?"}pts)`)
  return [
    `[${data.ID ?? gameId}] ${data.Title ?? "(untitled)"} (${data.ConsoleName ?? "?"})`,
    `Achievements: ${list.length}`,
    shown.length ? `Sample:\n- ${shown.join("\n- ")}` : "",
    data.ImageIcon ? `https://retroachievements.org${data.ImageIcon}` : "",
  ].filter(Boolean).join("\n")
}

export async function userProgress(username: string): Promise<string> {
  if (!username.trim()) throw new RaError("Username is empty.")
  const data = await getJson<Raw>("/API_GetUserSummary.php", { u: username.trim(), g: "10", a: "10" })
  const lines = [
    `${username.trim()}`,
    data.TotalPoints ? `Points: ${Number(data.TotalPoints).toLocaleString()} (rank #${data.Rank ?? "?"})` : "",
    data.TotalTruePoints ? `True points: ${Number(data.TotalTruePoints).toLocaleString()}` : "",
  ].filter(Boolean)
  const recent: Raw[] = Array.isArray(data.RecentlyPlayed) ? data.RecentlyPlayed : []
  if (recent.length) {
    lines.push(`Recently played:\n- ${recent.slice(0, 5).map((g) => `${String(g.Title ?? "?")} (${g.ConsoleName ?? "?"})`).join("\n- ")}`)
  }
  return lines.join("\n")
}
