const BASE = "https://api.alternative.me/fng"
const UA = "mrfentmen-fear-greed-mcp/1.0 (https://github.com/mrfentmen)"
export class FearGreedError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new FearGreedError("Fear and Greed API rate limit hit, wait and retry")
  if (!res.ok) throw new FearGreedError(`Fear and Greed error ${res.status}`)
  return (await res.json()) as T
}

function fmt(d: any): string {
  const label = d?.value_classification ?? "n/a"
  return `Value: ${d?.value ?? "n/a"} (${label})\nDate: ${d?.timestamp ? new Date(Number(d.timestamp) * 1000).toISOString().slice(0, 10) : "n/a"}`
}

export async function current(args: Record<string, never>): Promise<string> {
  const d = await get<any>(`${BASE}/?limit=1`)
  const item = d?.data?.[0]
  if (!item) return "No data"
  return `Current fear and greed index:\n${fmt(item)}`
}

export async function history(args: { days?: number }): Promise<string> {
  const days = Math.min(Math.max(args.days ?? 7, 1), 90)
  const d = await get<any>(`${BASE}/?limit=${days}`)
  const items = d?.data ?? []
  if (!items.length) return "No data"
  return items.map(fmt).join("\n\n")
}
