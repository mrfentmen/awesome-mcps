const BASE = "https://uselessfacts.jsph.pl/api/v2/facts"
const UA = "mrfentmen-facts-mcp/1.0 (https://github.com/mrfentmen)"
export class FactsError extends Error {}

export async function randomFact(args: Record<string, never>): Promise<string> {
  const res = await fetch(`${BASE}/random`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new FactsError("UselessFacts rate limit hit, wait and retry")
  if (!res.ok) throw new FactsError(`UselessFacts error ${res.status}`)
  const d = (await res.json()) as any
  return d?.text ?? "No fact returned"
}
