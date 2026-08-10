const BASE = "https://api.stackexchange.com/2.3"
const UA = "mrfentmen-stackexchange-mcp/1.0 (https://github.com/mrfentmen)"
export class StackexchangeError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) {
    const b = await res.text().catch(() => "")
    throw new StackexchangeError(`Stack Exchange returned HTTP ${res.status} ${b.slice(0, 80)}`)
  }
  return (await res.json()) as T
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export async function search(args: { query?: string; site?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new StackexchangeError("Provide a search query")
  const site = (args.site ?? "stackoverflow").trim()
  const limit = Math.min(args.limit ?? 10, 20)
  const d = await get<any>(
    `${BASE}/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(q)}&site=${encodeURIComponent(site)}&pagesize=${limit}`
  )
  const items = (d?.items ?? []) as any[]
  if (!items.length) return `No questions found on ${site}`
  return `Questions on ${site}:\n` + items.map((it, i) => {
    const d2 = it?.creation_date ? new Date(it.creation_date * 1000).toISOString().slice(0, 10) : ""
    return `${i + 1}. [${it?.score ?? 0}] ${stripHtml(it?.title ?? "n/a")} | answers ${it?.answer_count ?? 0} | ${d2}\n   ${it?.link ?? ""}`
  }).join("\n")
}

export async function answers(args: { questionId?: number; site?: string; limit?: number }): Promise<string> {
  const id = Number(args.questionId)
  if (!Number.isInteger(id) || id <= 0) throw new StackexchangeError("Provide a positive question ID")
  const site = (args.site ?? "stackoverflow").trim()
  const limit = Math.min(args.limit ?? 5, 10)
  const d = await get<any>(
    `${BASE}/questions/${id}/answers?order=desc&sort=votes&site=${encodeURIComponent(site)}&pagesize=${limit}&filter=withbody`
  )
  const items = (d?.items ?? []) as any[]
  if (!items.length) return `No answers found for question ${id}`
  return `Top answers for question ${id} on ${site}:\n` + items.map((it, i) => {
    const owner = it?.owner?.display_name ?? "anonymous"
    const body = stripHtml(it?.body ?? "").slice(0, 400)
    return `${i + 1}. ${it?.score ?? 0} votes by ${owner}\n   ${body || "no text"}`
  }).join("\n\n")
}
