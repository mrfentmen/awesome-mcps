const BASE = "https://api.cdnjs.com/libraries"
const UA = "mrfentmen-cdnjs-mcp/1.0 (https://github.com/mrfentmen)"
export class CdnjsError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new CdnjsError(`cdnjs returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new CdnjsError("Provide a search query")
  const limit = Math.min(args.limit ?? 10, 20)
  const d = await get<any>(`${BASE}?search=${encodeURIComponent(q)}&fields=name,latest,description&limit=${limit}`)
  const list = (d?.results ?? []) as any[]
  if (!list.length) return `No libraries found for \"${q}\"`
  return `cdnjs libraries for \"${q}\" (${d?.total ?? list.length} total):\n` + list.map((l: any, i: number) => {
    const latest = l?.latest ? ` v${l.latest}` : ""
    return `${i + 1}. ${l?.name ?? "n/a"}${latest}\n   ${(l?.description ?? "no description").slice(0, 140)}`
  }).join("\n")
}

export async function library(args: { name?: string }): Promise<string> {
  const name = (args.name ?? "").trim()
  if (!name) throw new CdnjsError("Provide a library name like react")
  const l = await get<any>(`${BASE}/${encodeURIComponent(name)}`)
  if (!l?.name) throw new CdnjsError(`Library not found: ${name}`)
  const lines = [
    `Library: ${l?.name ?? name}`,
    `Latest: ${l?.latest ?? "n/a"}`,
    `Description: ${(l?.description ?? "n/a").slice(0, 300)}`,
    `Versions: ${(l?.versions ?? []).length}`,
  ]
  if (l?.homepage) lines.push(`Homepage: ${l.homepage}`)
  if (l?.filename) lines.push(`Main file: ${l.filename}`)
  return lines.join("\n")
}
