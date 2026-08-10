const BASE = "https://lobste.rs"
const UA = "mrfentmen-lobsters-mcp/1.0 (https://github.com/mrfentmen)"
export class LobstersError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new LobstersError(`Lobsters error ${res.status}`)
  return (await res.json()) as T
}

function fmt(rows: any[], limit: number): string {
  return rows.slice(0, limit).map((s: any, i: number) =>
    `${i + 1}. ${s.title ?? ""} (${s.score ?? 0} pts, ${s.comment_count ?? 0} comments)\n   ${s.url ?? `https://lobste.rs/s/${s.short_id ?? ""}`}`
  ).join("\n\n") || "No stories"
}

export async function newest(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 25)
  const rows = await get<any[]>(`${BASE}/newest.json?limit=${limit}`)
  return `Newest on Lobsters\n${fmt(rows, limit)}`
}

export async function top(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 25)
  const rows = await get<any[]>(`${BASE}/top.json?limit=${limit}`)
  return `Top on Lobsters\n${fmt(rows, limit)}`
}
