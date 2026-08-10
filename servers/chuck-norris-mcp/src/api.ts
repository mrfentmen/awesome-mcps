const BASE = "https://api.chucknorris.io"
const UA = "mrfentmen-chuck-norris-mcp/1.0 (https://github.com/mrfentmen)"
export class ChuckError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new ChuckError(`Chuck Norris API returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function random(_args?: unknown): Promise<string> {
  const d = await get<any>(`${BASE}/jokes/random`)
  return d?.value ?? "No joke found"
}

export async function categories(_args?: unknown): Promise<string> {
  const d = await get<string[]>(`${BASE}/jokes/categories`)
  const list = d ?? []
  if (!list.length) return "No categories found"
  return `Chuck Norris joke categories (${list.length}):\n` + list.map((c, i) => `${i + 1}. ${c}`).join("\n")
}
