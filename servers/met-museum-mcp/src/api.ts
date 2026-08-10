const BASE = "https://collectionapi.metmuseum.org/public/collection/v1"
const UA = "mrfentmen-met-museum-mcp/1.0 (https://github.com/mrfentmen)"
export class MetError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new MetError(`Met Museum returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function object(args: { id?: number }): Promise<string> {
  const id = Number(args.id)
  if (!Number.isInteger(id) || id <= 0) throw new MetError("Provide a positive object ID")
  const o = await get<any>(`${BASE}/objects/${id}`)
  if (!o?.objectID) throw new MetError(`Object not found: ${id}`)
  const lines = [
    `Title: ${o?.title ?? "n/a"}`,
    `Artist: ${o?.artistDisplayName ?? "n/a"}${o?.artistBeginDate || o?.artistEndDate ? ` (${o.artistBeginDate ?? ""}-${o.artistEndDate ?? ""})` : ""}`,
    `Date: ${o?.objectDate ?? "n/a"}`,
    `Medium: ${o?.medium ?? "n/a"}`,
    `Department: ${o?.department ?? "n/a"}`,
    `Culture: ${o?.culture ?? "n/a"}`,
    `Credit: ${o?.creditLine ?? "n/a"}`,
  ]
  if (o?.primaryImage) lines.push(`\nImage: ${o.primaryImage}`)
  if (o?.objectURL) lines.push(`Page: ${o.objectURL}`)
  return lines.join("\n")
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new MetError("Provide a search query")
  const limit = Math.min(args.limit ?? 6, 10)
  const d = await get<any>(`${BASE}/search?q=${encodeURIComponent(q)}`)
  const ids = ((d?.objectIDs ?? []) as number[]).slice(0, limit)
  const total = d?.total ?? 0
  if (!ids.length) return `No Met objects found for \"${q}\"`
  const rows: string[] = []
  for (const id of ids) {
    try {
      const o = await get<any>(`${BASE}/objects/${id}`)
      rows.push(`${id} | ${o?.title ?? "n/a"} | ${o?.objectDate ?? ""} | ${o?.artistDisplayName ?? "unknown artist"}`)
    } catch {
      rows.push(`${id} | (detail fetch failed)`)
    }
  }
  return `Met collection results for \"${q}\" (${total} total, ${rows.length} shown):\n` + rows.map((r, i) => `${i + 1}. ${r}`).join("\n")
}
