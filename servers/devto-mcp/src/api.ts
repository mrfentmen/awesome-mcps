const BASE = "https://dev.to/api"
const UA = "mrfentmen-devto-mcp/1.0 (https://github.com/mrfentmen)"
export class DevtoError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/vnd.forem.api-v1+json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new DevtoError("dev.to rate limit hit, wait and retry")
  if (!res.ok) throw new DevtoError(`dev.to error ${res.status}`)
  return (await res.json()) as T
}

function fmt(a: any, i: number): string {
  const tags = (a?.tag_list ?? []).join(", ")
  return `${i + 1}. ${a?.title ?? "Untitled"}\n   ${tags || "no tags"} | ${a?.positive_reactions_count ?? 0} reactions | ${a?.comments_count ?? 0} comments\n   by ${a?.user?.name ?? "n/a"} | ${a?.url ?? ""}`
}

export async function latestArticles(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 30)
  const d = await get<any[]>(`${BASE}/articles?per_page=${limit}`)
  if (!d?.length) return "No articles"
  return d.map(fmt).join("\n\n")
}

export async function searchArticles(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new DevtoError("Provide search terms")
  const limit = Math.min(args.limit ?? 10, 30)
  const d = await get<any[]>(`${BASE}/articles?per_page=${limit}&tag=${encodeURIComponent(q)}`)
  if (!d?.length) return `No articles for ${q}`
  return d.map(fmt).join("\n\n")
}
