const BASE = "https://api.coingecko.com/api/v3"
const UA = "mrfentmen-crypto-prices-mcp/1.0 (https://github.com/mrfentmen)"
export class CryptoError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new CryptoError("CoinGecko rate limit hit, wait and retry")
  if (!res.ok) throw new CryptoError(`CoinGecko error ${res.status}`)
  return (await res.json()) as T
}

export async function price(args: { coins?: string; currency?: string }): Promise<string> {
  const coins = (args.coins ?? "bitcoin").split(",").map((c) => c.trim()).filter(Boolean).slice(0, 10)
  const currency = (args.currency ?? "usd").toLowerCase()
  const d = await get<Record<string, Record<string, number>>>(`${BASE}/simple/price?ids=${coins.join(",")}&vs_currencies=${currency}`)
  const out = coins.map((c) => {
    const v = d[c]?.[currency]
    return `${c}: ${v === undefined ? "n/a" : v.toLocaleString()} ${currency.toUpperCase()}`
  })
  return out.join("\n")
}

export async function trending(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 20)
  const d = await get<any>(`${BASE}/search/trending`)
  const rows = (d.coins ?? []).slice(0, limit)
  return rows.map((r: any, i: number) => {
    const c = r.item ?? {}
    return `${i + 1}. ${c.name ?? ""} (${c.symbol ?? ""}) | rank ${c.market_cap_rank ?? "?"}\n   ${(c.data?.price ?? "price n/a").replace(/[<>&$]/g, "")} | ${(c.data?.market_cap ?? "").replace(/[<>&$]/g, "")}`
  }).join("\n\n") || "None trending"
}
