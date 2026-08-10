const BASE = "https://endoflife.date/api"
const UA = "mrfentmen-endoflife-mcp/1.0 (https://github.com/mrfentmen)"
export class EolError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new EolError("endoflife.date rate limit hit, wait and retry")
  if (!res.ok) throw new EolError(`endoflife.date error ${res.status}`)
  return (await res.json()) as T
}

export async function productCycles(args: { product?: string }): Promise<string> {
  const product = (args.product ?? "").trim().toLowerCase()
  if (!product) throw new EolError("Provide a product name like nodejs or python")
  const d = await get<any[]>(`${BASE}/${encodeURIComponent(product)}.json`)
  if (!d?.length) return `No data for ${product}`
  return `Release cycles for ${product}:\n\n${d.map((c: any) => {
    const eol = c?.eol === true ? "no longer supported" : c?.eol ?? "n/a"
    const lts = c?.lts === true ? "yes" : typeof c?.lts === "string" ? c.lts : "no"
    return `${c.cycle} | released ${c.releaseDate ?? "?"} | latest ${c.latest ?? "?"} | EOL ${eol} | LTS ${lts}`
  }).join("\n")}`
}

export async function allProducts(args: Record<string, never>): Promise<string> {
  const d = await get<string[]>(`${BASE}/all.json`)
  if (!d?.length) return "No products"
  return `Tracked products (${d.length}):\n${d.slice(0, 60).join(", ")}${d.length > 60 ? ", ..." : ""}`
}
