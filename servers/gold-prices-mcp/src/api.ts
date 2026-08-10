const BASE = "https://api.gold-api.com/price"
const UA = "mrfentmen-gold-prices-mcp/1.0 (https://github.com/mrfentmen)"
export class GoldError extends Error {}

const METALS: Record<string, string> = {
  XAU: "Gold",
  XAG: "Silver",
  XPT: "Platinum",
  XPD: "Palladium",
}

export async function price(args: { metal?: string }): Promise<string> {
  const metal = (args.metal ?? "XAU").trim().toUpperCase()
  if (!METALS[metal]) throw new GoldError("Metal must be XAU, XAG, XPT, or XPD")
  const res = await fetch(`${BASE}/${metal}`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new GoldError("Gold API rate limit hit, wait and retry")
  if (!res.ok) throw new GoldError(`Gold API error ${res.status}`)
  const d = (await res.json()) as any
  return `${METALS[metal]} (${metal}): $${Number(d?.price ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${d?.currency ?? "USD"}\nUpdated: ${d?.updatedAtReadable ?? d?.updatedAt ?? "n/a"}`
}
