const BASE = "https://api.urbandictionary.com/v0"
const UA = "mrfentmen-slang-dictionary-mcp/1.0 (https://github.com/mrfentmen)"
export class SlangError extends Error {}

export async function define(args: { term?: string; limit?: number }): Promise<string> {
  const term = (args.term ?? "").trim()
  if (!term) throw new SlangError("Provide a term")
  const limit = Math.min(args.limit ?? 3, 10)
  const res = await fetch(`${BASE}/define?term=${encodeURIComponent(term)}`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new SlangError(`Urban Dictionary error ${res.status}`)
  const d = await res.json()
  const rows = (d.list ?? []).slice(0, limit)
  return rows.map((r: any, i: number) =>
    `${term} (${i + 1}): ${(r.definition ?? "").replace(/\s+/g, " ").slice(0, 400)}\n  Example: ${(r.example ?? "").replace(/\s+/g, " ").slice(0, 200)}\n  ${r.thumbs_up ?? 0} up | ${r.thumbs_down ?? 0} down`
  ).join("\n\n") || `No definitions for ${term}`
}
