const BASE = "https://www.freetogame.com/api"
const UA = "mrfentmen-freetogame-mcp/1.0 (https://github.com/mrfentmen)"
export class FreetogameError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new FreetogameError(`FreeToGame returned HTTP ${res.status}`)
  return (await res.json()) as T
}

const VALID_CATS = ["mmorpg", "shooter", "strategy", "moba", "racing", "sports", "social", "sandbox", "open-world", "survival", "pvp", "pve", "pixel", "voxel", "zombie", "turn-based", "first-person", "third-person", "top-down", "tank", "space", "sailing", "side-scroller", "hero-shooter", "fighting", "battle-royale", "mmo", "mmofps", "mmotps", "3d", "2d", "anime", "fantasy", "sci-fi", "fighting", "action-rpg", "action", "military", "martial-arts", "flight", "low-spec", "tower-defense", "horror", "mmorts"]

function fmtGame(g: any, i: number): string {
  return `${i + 1}. ${g?.title ?? "n/a"} | ${g?.genre ?? ""} | ${g?.platform ?? ""}\n   ${(g?.short_description ?? "").slice(0, 140)} | ${g?.release_date ?? ""} | ${g?.freetogame_profile_url ?? ""}`
}

export async function games(args: { platform?: string; category?: string; sortBy?: string }): Promise<string> {
  const platform = (args.platform ?? "pc").trim().toLowerCase()
  const category = (args.category ?? "").trim()
  const sortBy = (args.sortBy ?? "").trim()
  const params = new URLSearchParams()
  if (platform && platform !== "all") params.set("platform", platform)
  if (category) {
    if (!VALID_CATS.includes(category.toLowerCase())) throw new FreetogameError(`Unknown category ${category}`)
    params.set("category", category)
  }
  if (sortBy) params.set("sort-by", sortBy)
  const qs = params.toString()
  const d = await get<any[]>(`${BASE}/games${qs ? `?${qs}` : ""}`)
  const list = (d ?? []).slice(0, 20)
  if (!list.length) return "No games found with those filters"
  return `Free games (${list.length} shown):\n` + list.map(fmtGame).join("\n")
}

export async function game(args: { id?: number }): Promise<string> {
  const id = Number(args.id)
  if (!Number.isInteger(id) || id <= 0) throw new FreetogameError("Provide a positive game ID")
  const g = await get<any>(`${BASE}/game?id=${id}`)
  if (!g?.id) throw new FreetogameError(`Game not found: ${id}`)
  const req = g?.minimum_system_requirements ?? {}
  const lines = [
    `${g?.title ?? "n/a"} | ${g?.genre ?? ""} | ${g?.platform ?? ""} | ${g?.release_date ?? ""}`,
    `Publisher: ${g?.publisher ?? "n/a"} | Developer: ${g?.developer ?? "n/a"}`,
    `\n${(g?.description ?? "no description").slice(0, 700)}`,
    g?.game_url ? `\nPlay: ${g.game_url}` : "",
    req?.graphics ? `\nMinimum requirements: OS ${req.os ?? "n/a"}, CPU ${req.processor ?? "n/a"}, RAM ${req.memory ?? "n/a"}, GPU ${req.graphics}` : "",
  ]
  return lines.filter((l) => l !== "").join("\n")
}
