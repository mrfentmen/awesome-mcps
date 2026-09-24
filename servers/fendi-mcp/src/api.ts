export class FendiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "FendiError"
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

const UA = { "User-Agent": "awesome-mcps/1.0" }
const VENDORS: string[] = ["fendi"]

interface Source { name: string; catalog: string; suggest: string; product: (handle: string) => string }

const SOURCES: Source[] = [
  {
    name: "fashionphile",
    catalog: "https://www.fashionphile.com/products.json",
    suggest: "https://www.fashionphile.com/search/suggest.json",
    product: (handle: string) => `https://www.fashionphile.com/products/${encodeURIComponent(handle)}.js`,
  },
  {
    name: "rebag",
    catalog: "https://shop.rebag.com/products.json",
    suggest: "https://shop.rebag.com/search/suggest.json",
    product: (handle: string) => `https://shop.rebag.com/products/${encodeURIComponent(handle)}.js`,
  },
]

function matchesBrand(vendor: unknown): boolean {
  const v = String(vendor ?? "").toLowerCase()
  return VENDORS.some((s) => v.includes(s))
}

interface Slim { source: string; id: number; title: string; handle: string; vendor: string; product_type: string; price_usd: number | null; compare_at_usd: number | null; available: boolean; url: string; image: string | null }

function slim(source: string, base: string, p: any): Slim {
  const variants = Array.isArray(p.variants) ? p.variants : []
  const prices = variants.map((v: any) => Number(v.price)).filter((n: number) => Number.isFinite(n))
  const comps = variants.map((v: any) => Number(v.compare_at_price)).filter((n: number) => Number.isFinite(n))
  const images = Array.isArray(p.images) ? p.images : []
  return {
    source,
    id: p.id,
    title: p.title,
    handle: p.handle,
    vendor: p.vendor,
    product_type: p.product_type,
    price_usd: prices.length ? Math.min(...prices) : null,
    compare_at_usd: comps.length ? Math.min(...comps) : null,
    available: variants.some((v: any) => v.available),
    url: `${base}/${p.handle}`,
    image: images.length ? images[0].src ?? null : null,
  }
}

function pretty(data: unknown): string {
  const t = typeof data === "string" ? data : JSON.stringify(data, null, 2)
  return t.length > 12000 ? t.slice(0, 12000) + "\n…(truncated)" : t
}

async function getJson(url: string): Promise<any> {
  let res: Response
  try {
    res = await fetch(url, { headers: { ...UA } })
  } catch (e) {
    throw new FendiError(`Network error: ${(e as Error).message}`)
  }
  if (!res.ok) throw new FendiError(`HTTP ${res.status} for ${new URL(url).hostname}`)
  return res.json()
}

async function catalog(source: Source, page: number): Promise<any[]> {
  const data = await getJson(`${source.catalog}?limit=250&page=${page}`)
  const products = Array.isArray(data.products) ? data.products : []
  return products.filter((p: any) => matchesBrand(p.vendor))
}

export async function searchListings(query: string, limit?: string): Promise<string> {
  const n = Math.min(Number(limit ?? 10) || 10, 25)
  const out: Slim[] = []
  for (const s of SOURCES) {
    try {
      const data = await getJson(`${s.suggest}?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=${n}`)
      const products = data?.resources?.results?.products ?? []
      const base = s.catalog.replace("/products.json", "")
      for (const p of products) {
        if (matchesBrand(p.vendor)) out.push(slim(s.name, base, p))
        if (out.length >= n) break
      }
    } catch { /* source down — keep the other */ }
    if (out.length >= n) break
  }
  return pretty({ brand: "Fendi", query, count: out.length, listings: out.slice(0, n) })
}

export async function listNewest(limit?: string, page?: string): Promise<string> {
  const n = Math.min(Number(limit ?? 20) || 20, 50)
  const pg = Math.max(Number(page ?? 1) || 1, 1)
  const out: Slim[] = []
  for (const s of SOURCES) {
    try {
      const base = s.catalog.replace("/products.json", "")
      for (const p of await catalog(s, pg)) out.push(slim(s.name, base, p))
    } catch { /* source down — keep the other */ }
  }
  return pretty({ brand: "Fendi", page: pg, count: out.length, listings: out.slice(0, n) })
}

export async function getListing(handle: string, source?: string): Promise<string> {
  const sources = source ? SOURCES.filter((s) => s.name === source) : SOURCES
  if (!sources.length) throw new FendiError(`Unknown source '${source}'. Use fashionphile or rebag.`)
  for (const s of sources) {
    try {
      return pretty({ brand: "Fendi", source: s.name, product: await getJson(s.product(handle)) })
    } catch { /* try next source */ }
  }
  throw new FendiError(`Listing '${handle}' not found on ${sources.map((s) => s.name).join(", ")}.`)
}

export async function priceOverview(limit?: string): Promise<string> {
  const n = Math.min(Number(limit ?? 200) || 200, 500)
  const prices: number[] = []
  for (const s of SOURCES) {
    try {
      const base = s.catalog.replace("/products.json", "")
      for (const p of await catalog(s, 1)) {
        const sl = slim(s.name, base, p)
        if (sl.price_usd !== null) prices.push(sl.price_usd)
        if (prices.length >= n) break
      }
    } catch { /* source down — keep the other */ }
    if (prices.length >= n) break
  }
  if (!prices.length) throw new FendiError("No priced listings found.")
  prices.sort((a, b) => a - b)
  const mid = (arr: number[]) => arr.length % 2 ? arr[(arr.length - 1) / 2] : (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2
  return pretty({
    brand: "Fendi", currency: "USD", sample: prices.length,
    min: prices[0], p25: prices[Math.floor(prices.length * 0.25)],
    median: mid(prices), p75: prices[Math.floor(prices.length * 0.75)], max: prices[prices.length - 1],
    note: "Asking prices on resale sources, not appraisals. Not affiliated with Fendi.",
  })
}
