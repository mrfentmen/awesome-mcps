const UA = "mrfentmen-quotes-mcp/1.0 (https://github.com/mrfentmen)"
export class QuotesError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new QuotesError(`Quotes API error ${res.status}`)
  return (await res.json()) as T
}

export async function quoteOfTheDay(_args: Record<string, never>): Promise<string> {
  const d = await get<any>("https://favqs.com/api/qotd")
  const q = d.quote ?? {}
  return `"${q.body ?? ""}"\n- ${q.author ?? "unknown"}`
}

export async function randomQuote(_args: Record<string, never>): Promise<string> {
  const arr = await get<any[]>("https://zenquotes.io/api/random")
  const q = arr?.[0] ?? {}
  return `"${q.q ?? ""}"\n- ${q.a ?? "unknown"}`
}
