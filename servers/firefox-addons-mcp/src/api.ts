const BASE = "https://addons.mozilla.org/api/v5"
const UA = "mrfentmen-firefox-addons-mcp/1.0 (https://github.com/mrfentmen)"
export class AmoError extends Error {}

function str(v: unknown, fallback = ""): string {
  if (v == null) return fallback
  if (typeof v === "string") return v
  if (typeof v === "object") {
    const first = Object.values(v as Record<string, unknown>)[0]
    return typeof first === "string" ? first : fallback
  }
  return String(v)
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new AmoError(`AMO returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new AmoError("Provide a search query")
  const limit = Math.min(args.limit ?? 10, 20)
  const d = await get<any>(`${BASE}/addons/search/?q=${encodeURIComponent(q)}&page_size=${limit}`)
  const list = (d?.results ?? []) as any[]
  if (!list.length) return `No add-ons found for \"${q}\"`
  return `Firefox add-ons for \"${q}\" (${d?.count ?? list.length} total):\n` + list.map((a: any, i: number) => {
    const users = a?.average_daily_users != null ? a.average_daily_users.toLocaleString() : "?"
    const downloads = a?.weekly_downloads != null ? a.weekly_downloads.toLocaleString() : "?"
    const ver = a?.current_version?.version ?? ""
    return `${i + 1}. ${str(a?.name, "n/a")} v${ver}\n   ${str(a?.summary, "no summary").slice(0, 130)} | ${users} daily users | ${downloads} weekly downloads`
  }).join("\n")
}

export async function addon(args: { slug?: string }): Promise<string> {
  const slug = (args.slug ?? "").trim()
  if (!slug) throw new AmoError("Provide an add-on slug like ublock-origin")
  const a = await get<any>(`${BASE}/addons/addon/${encodeURIComponent(slug)}/`)
  if (!a?.id) throw new AmoError(`Add-on not found: ${slug}`)
  const lines = [
    `${str(a?.name, "n/a")} v${a?.current_version?.version ?? ""}`,
    `Summary: ${str(a?.summary, "n/a")}`,
    `Daily users: ${a?.average_daily_users?.toLocaleString() ?? "n/a"}`,
    `Weekly downloads: ${a?.weekly_downloads?.toLocaleString() ?? "n/a"}`,
    `Rating: ${a?.ratings?.average != null ? `${a.ratings.average.toFixed(1)}/5 (${a.ratings.count} reviews)` : "n/a"}`,
    `\n${str(a?.description, "no description").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 500)}`,
  ]
  if (a?.url) lines.push(`\nPage: ${a.url}`)
  return lines.join("\n")
}
