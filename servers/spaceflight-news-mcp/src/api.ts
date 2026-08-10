const BASE = "https://api.spaceflightnewsapi.net/v4"
const UA = "mrfentmen-spaceflight-news-mcp/1.0 (https://github.com/mrfentmen)"
export class SfnewsError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new SfnewsError(`Spaceflight News returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function articles(args: { limit?: number; search?: string }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 25)
  const search = (args.search ?? "").trim()
  const params = new URLSearchParams({ limit: String(limit), ordering: "-published_at" })
  if (search) params.set("search", search)
  const d = await get<any>(`${BASE}/articles/?${params.toString()}`)
  const list = (d?.results ?? []) as any[]
  if (!list.length) return "No articles found"
  return `Space news${search ? ` for \"${search}\"` : ""} (${d?.count ?? list.length} total):\n` + list.map((a: any, i: number) => {
    const date = a?.published_at ? new Date(a.published_at).toISOString().slice(0, 10) : ""
    return `${i + 1}. [${a?.news_site ?? "n/a"}] ${a?.title ?? "n/a"}\n   ${date} | ${a?.url ?? ""}`
  }).join("\n")
}

export async function article(args: { id?: number }): Promise<string> {
  const id = Number(args.id)
  if (!Number.isInteger(id) || id <= 0) throw new SfnewsError("Provide a positive article ID")
  const a = await get<any>(`${BASE}/articles/${id}/`)
  const date = a?.published_at ? new Date(a.published_at).toISOString().replace("T", " ").slice(0, 16) : ""
  const lines = [
    `${a?.title ?? "n/a"}`,
    `${a?.news_site ?? ""} | ${date}`,
    `\n${(a?.summary ?? "no summary").slice(0, 600)}`,
  ]
  if (a?.url) lines.push(`\nRead: ${a.url}`)
  if (a?.image_url) lines.push(`Image: ${a.image_url}`)
  return lines.join("\n")
}
