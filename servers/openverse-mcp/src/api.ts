const BASE = "https://api.openverse.org/v1"
const UA = "mrfentmen-openverse-mcp/1.0 (https://github.com/mrfentmen)"
export class OpenverseError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new OpenverseError("Openverse rate limit hit, wait and retry")
  if (!res.ok) throw new OpenverseError(`Openverse error ${res.status}`)
  return (await res.json()) as T
}

export async function searchImages(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new OpenverseError("Provide search terms")
  const limit = Math.min(args.limit ?? 8, 20)
  const d = await get<any>(`${BASE}/images/?q=${encodeURIComponent(q)}&page_size=${limit}`)
  const results = d?.results ?? []
  if (!results.length) return "No images found"
  return results.map((img: any, i: number) => {
    const title = (img?.title ?? "Untitled").slice(0, 80)
    const license = img?.license ?? "n/a"
    const url = img?.url ?? img?.thumbnail ?? img?.foreign_landing_url ?? ""
    return `${i + 1}. ${title}\n   License: ${license}${img?.creator ? ` | by ${img.creator}` : ""}\n   ${url}`
  }).join("\n\n")
}
