const BASE = "https://bible-api.com"
const UA = "mrfentmen-bible-mcp/1.0 (https://github.com/mrfentmen)"
export class BibleError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) })
  if (res.status === 404) throw new BibleError("Reference not found")
  if (!res.ok) throw new BibleError(`Bible API error ${res.status}`)
  return (await res.json()) as T
}

export async function verse(args: { reference?: string }): Promise<string> {
  const ref = (args.reference ?? "").trim()
  if (!ref) throw new BibleError("Provide a reference like John 3:16")
  const d = await get<any>(`${BASE}/${encodeURIComponent(ref)}`)
  const verses = (d.verses ?? []).map((v: any) => `${v.book_name ?? ""} ${v.chapter ?? ""}:${v.verse ?? ""} ${(v.text ?? "").trim()}`).join("\n\n")
  return `${d.reference ?? ref}\n${d.translation ?? ""}\n\n${verses}`
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new BibleError("Provide a search phrase")
  const limit = Math.min(args.limit ?? 8, 20)
  const d = await get<any>(`${BASE}/?search=${encodeURIComponent(q)}&limit=${limit}`)
  const rows = d.verses ?? []
  return rows.map((v: any) =>
    `${v.book_name ?? ""} ${v.chapter ?? ""}:${v.verse ?? ""}\n  ${(v.text ?? "").trim().slice(0, 200)}`
  ).join("\n\n") || "No matches found"
}
