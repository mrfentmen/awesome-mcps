const BASE = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions"
const UA = "mrfentmen-epic-free-games-mcp/1.0 (https://github.com/mrfentmen)"
export class EpicError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new EpicError("Epic Store rate limit hit, wait and retry")
  if (!res.ok) throw new EpicError(`Epic Store error ${res.status}`)
  return (await res.json()) as T
}

export async function freeGames(args: Record<string, never>): Promise<string> {
  const d = await get<any>(`${BASE}?locale=en-US&country=US&allowCountries=US`)
  const games = d?.data?.Catalog?.searchStore?.elements ?? []
  const free = games.filter((g: any) => g?.promotions?.promotionalOffers?.length)
  if (!free.length) return "No free games right now"
  return free.map((g: any) => {
    const offer = g.promotions.promotionalOffers[0]?.promotionalOffers?.[0]
    const end = offer?.endDate ? new Date(offer.endDate) : null
    const endStr = end ? end.toISOString().slice(0, 10) : "unknown"
    return `${g.title ?? "Untitled"}\n   Free until ${endStr} | ${g.originalPrice ?? 0} cents normally${g.description ? `\n   ${g.description.slice(0, 160)}` : ""}`
  }).join("\n\n")
}
