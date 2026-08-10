const BASE = "https://www.bing.com/HPImageArchive.aspx"
const UA = "mrfentmen-bing-wallpaper-mcp/1.0 (https://github.com/mrfentmen)"
export class BingError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new BingError("Bing feed rate limit hit, wait and retry")
  if (!res.ok) throw new BingError(`Bing feed error ${res.status}`)
  return (await res.json()) as T
}

function fmt(img: any): string {
  const url = `https://www.bing.com${img?.url ?? ""}`
  const copyright = (img?.copyright ?? "").replace(/ \(© .*?\)$/, "")
  return `${img?.title ?? "Untitled"}\n${copyright}\n${url}`
}

export async function today(args: Record<string, never>): Promise<string> {
  const d = await get<any>(`${BASE}?format=js&idx=0&n=1`)
  const img = d?.images?.[0]
  if (!img) return "No wallpaper data"
  return `Today Bing wallpaper:\n${fmt(img)}`
}

export async function recent(args: { count?: number }): Promise<string> {
  const count = Math.min(Math.max(args.count ?? 3, 1), 8)
  const d = await get<any>(`${BASE}?format=js&idx=0&n=${count}`)
  const imgs = d?.images ?? []
  if (!imgs.length) return "No wallpaper data"
  return imgs.map((img: any, i: number) => `${i + 1}. ${fmt(img)}`).join("\n\n")
}
