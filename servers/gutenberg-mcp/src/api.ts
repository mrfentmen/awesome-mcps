const BASE = "https://gutendex.com"
const UA = "mrfentmen-gutenberg-mcp/1.0 (https://github.com/mrfentmen)"
export class GutenbergError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, redirect: "follow", signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new GutenbergError("Gutendex rate limit hit, wait and retry")
  if (!res.ok) throw new GutenbergError(`Gutendex error ${res.status}`)
  return (await res.json()) as T
}

function fmtBook(b: any): string {
  const formats = b?.formats ?? {}
  const dl = formats["text/plain; charset=us-ascii"] || formats["text/plain; charset=utf-8"] || formats["text/html"] || ""
  return `${b?.title ?? "Untitled"} by ${(b?.authors ?? []).map((a: any) => a.name).join(", ") || "unknown"} (${b?.id ?? "id n/a"})\n   ${(b?.subjects ?? []).slice(0, 3).join("; ") || "no subjects"}${dl ? `\n   Download: ${dl}` : ""}`
}

export async function searchBooks(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new GutenbergError("Provide a search query")
  const limit = Math.min(args.limit ?? 5, 20)
  const d = await get<any>(`${BASE}/books?search=${encodeURIComponent(q)}`)
  const books = (d?.results ?? []).slice(0, limit)
  if (books.length === 0) return "No results"
  return books.map(fmtBook).join("\n\n")
}

export async function bookInfo(args: { bookId?: number }): Promise<string> {
  const id = args.bookId
  if (id === undefined || id <= 0) throw new GutenbergError("Provide a positive book ID")
  const b = await get<any>(`${BASE}/books/${id}`)
  return fmtBook(b)
}
