const UA = "mrfentmen-duckduckgo-mcp/1.0 (https://github.com/mrfentmen)"
export class DdgError extends Error {}

export async function instantAnswer(args: { query?: string }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new DdgError("Provide a query")
  const res = await fetch(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`,
    { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(30000) }
  )
  if (!res.ok) throw new DdgError(`DuckDuckGo returned HTTP ${res.status}`)
  const d = (await res.json()) as any
  const lines: string[] = []
  if (d?.Heading) lines.push(`Heading: ${d.Heading}`)
  if (d?.Answer) lines.push(`Answer: ${d.Answer}`)
  if (d?.Definition) lines.push(`Definition: ${d.Definition}`)
  if (d?.AbstractText) lines.push(`\nSummary:\n${d.AbstractText}`)
  if (d?.AbstractURL) lines.push(`\nSource: ${d.AbstractURL}`)
  const related = (d?.RelatedTopics ?? []).filter((t: any) => t?.Text).slice(0, 5)
  if (related.length) {
    lines.push("", "Related:")
    related.forEach((t: any, i: number) => lines.push(`${i + 1}. ${t.Text}`))
  }
  if (!lines.length) return `No instant answer found for \"${q}\". Try a more specific query.`
  return lines.join("\n")
}
