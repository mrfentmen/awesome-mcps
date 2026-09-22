/**
 * Blizzard Battle.net API client. Needs BLIZZARD_CLIENT_ID + BLIZZARD_CLIENT_SECRET
 * (free at https://develop.battle.net/). Uses client-credentials grant; token cached.
 * Docs: https://develop.battle.net/documentation
 */
const REGIONS = ["us", "eu", "kr", "tw"] as const
type Region = (typeof REGIONS)[number]

export class BlizzardError extends Error {}

let cached: { token: string; exp: number } | null = null

async function appToken(region: Region): Promise<string> {
  const id = process.env.BLIZZARD_CLIENT_ID
  const secret = process.env.BLIZZARD_CLIENT_SECRET
  if (!id || !secret) {
    throw new BlizzardError("Set BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET (free at develop.battle.net).")
  }
  if (cached && cached.exp > Date.now() + 60000) return cached.token
  const res = await fetch(`https://${region}.battle.net/oauth/token`, {
    method: "POST",
    headers: {
      "User-Agent": "blizzard-mcp/1.0",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new BlizzardError(`Blizzard OAuth failed (${res.status}). Check client id/secret.`)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await res.json()) as any
  if (!data.access_token) throw new BlizzardError("Blizzard OAuth returned no token.")
  cached = { token: data.access_token, exp: Date.now() + (data.expires_in ?? 86000) * 1000 }
  return cached.token
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function api<T>(region: Region, path: string, namespace: string): Promise<T> {
  const res = await fetch(`https://${region}.api.blizzard.com${path}?namespace=${namespace}&locale=en_US`, {
    headers: { "User-Agent": "blizzard-mcp/1.0", Accept: "application/json", Authorization: `Bearer ${await appToken(region)}` },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 404) throw new BlizzardError("Not found.")
  if (!res.ok) throw new BlizzardError(`Blizzard error ${res.status}`)
  return (await res.json()) as T
}

function checkRegion(r: string): Region {
  const clean = r.trim().toLowerCase()
  if ((REGIONS as readonly string[]).includes(clean)) return clean as Region
  throw new BlizzardError(`Region must be one of ${REGIONS.join(", ")}, got "${r}".`)
}

export async function wowTokenPrice(region: string): Promise<string> {
  const rg = checkRegion(region)
  const d = await api<Raw>(rg, "/data/wow/token/index", `dynamic-${rg}`)
  const price = d.price
  const updated = d.last_updated_timestamp ? new Date(d.last_updated_timestamp).toISOString().slice(0, 10) : "?"
  return `WoW Token (${rg.toUpperCase()}): ${(Number(price) / 10000).toLocaleString()} gold (updated ${updated})`
}

export interface Achievement {
  id: number
  name: string
}

export async function wowAchievements(region: string, limit = 10): Promise<Achievement[]> {
  const rg = checkRegion(region)
  const d = await api<Raw>(rg, "/data/wow/achievement/index", `static-${rg}`)
  const rows: Raw[] = Array.isArray(d.achievements) ? d.achievements : []
  return rows.slice(0, limit).map((a) => ({ id: Number(a.id), name: String(a.name ?? "?") }))
}

export interface Season {
  id: number
  name?: string
}

export async function diabloSeasons(region: string): Promise<Season[]> {
  const rg = checkRegion(region)
  const d = await api<Raw>(rg, "/data/d3/season/index", `static-${rg}`)
  const rows: Raw[] = Array.isArray(d.season) ? d.season : []
  return rows.slice(-5).map((s) => ({ id: Number(s.id), name: undefined })).reverse()
}
