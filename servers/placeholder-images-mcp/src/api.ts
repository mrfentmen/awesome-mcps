const BASE = "https://picsum.photos"
const UA = "mrfentmen-placeholder-images-mcp/1.0 (https://github.com/mrfentmen)"
export class PlaceholderError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, redirect: "follow", signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new PlaceholderError("picsum rate limit hit, wait and retry")
  if (!res.ok) throw new PlaceholderError(`picsum error ${res.status}`)
  return (await res.json()) as T
}

export async function imageUrl(args: { width?: number; height?: number; seed?: string }): Promise<string> {
  const w = Math.min(Math.max(Math.round(args.width ?? 640), 10), 4000)
  const h = Math.min(Math.max(Math.round(args.height ?? 480), 10), 4000)
  const seed = (args.seed ?? "").trim()
  const path = seed ? `/seed/${encodeURIComponent(seed)}/${w}/${h}` : `/${w}/${h}`
  return `Placeholder image (${w}x${h}${seed ? `, seed ${seed}` : ""}):\n${BASE}${path}\n\nReal photo from the public picsum.photos collection. Use the URL directly in an img tag or download it.`
}

export async function listImages(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 5, 30)
  const d = await get<any[]>(`${BASE}/v2/list?limit=${limit}`)
  if (!d.length) return "No images returned"
  return d.map((img: any, i: number) => `${i + 1}. id ${img?.id ?? "n/a"} | ${img?.width ?? "?"}x${img?.height ?? "?"} | ${img?.author ?? ""}\n   ${img?.download_url ?? ""}`).join("\n\n")
}
