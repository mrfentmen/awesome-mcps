const BASE = "https://api.wordpress.org/plugins/info/1.0"
const UA = "mrfentmen-wordpress-plugins-mcp/1.0 (https://github.com/mrfentmen)"
export class WpError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new WpError("WordPress API rate limit hit, wait and retry")
  if (!res.ok) throw new WpError(`WordPress API error ${res.status}`)
  return (await res.json()) as T
}

export async function pluginInfo(args: { slug?: string }): Promise<string> {
  const slug = (args.slug ?? "").trim()
  if (!slug) throw new WpError("Provide a plugin slug")
  const d = await get<any>(`${BASE}/${encodeURIComponent(slug)}.json`)
  if (d?.error) throw new WpError(d.error)
  return `Plugin: ${d.name ?? slug}\nVersion: ${d.version ?? "n/a"} | Requires WP: ${d.requires ?? "n/a"}\nRating: ${d.rating ?? "n/a"}/100 (${d.num_ratings ?? 0} ratings)\nDownloads: ${(d.downloads ?? 0).toLocaleString()} (active: ${(d.active_installs ?? 0).toLocaleString()})\nDescription: ${(d.short_description ?? d.sections?.description ?? "").slice(0, 300)}`
}

export async function searchPlugins(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new WpError("Provide search terms")
  const limit = Math.min(args.limit ?? 10, 30)
  const d = await get<any>(`${BASE}/search.php?q=${encodeURIComponent(q)}&fields=name,slug,version,rating,downloads,active_installs,short_description`)
  const plugins = d?.plugins ?? []
  if (!plugins.length) return "No plugins found"
  return plugins.slice(0, limit).map((p: any, i: number) => `${i + 1}. ${p.name} ${p.version ?? ""}\n   ${(p.short_description ?? "").slice(0, 110)} | ${(p.active_installs ?? 0).toLocaleString()} active`).join("\n\n")
}
