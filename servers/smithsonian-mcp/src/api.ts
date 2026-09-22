/**
 * Smithsonian Open Access API client. Needs SMITHSONIAN_API_KEY
 * (free at https://api.data.gov/signup/).
 * Docs: https://api.data.gov/docs/ed-oauth/
 */
const BASE = "https://api.si.edu/openaccess/api/v1.0"

export class SmithsonianError extends Error {}

function apiKey(): string {
  const k = process.env.SMITHSONIAN_API_KEY
  if (!k) throw new SmithsonianError("Set SMITHSONIAN_API_KEY first (free at api.data.gov/signup).")
  return k
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const sep = path.includes("?") ? "&" : "?"
  const res = await fetch(`${BASE}${path}${sep}api_key=${encodeURIComponent(apiKey())}`, {
    headers: { "User-Agent": "smithsonian-mcp/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(25000),
  })
  if (res.status === 401 || res.status === 403) throw new SmithsonianError("Smithsonian refused (401/403). Check API key.")
  if (res.status === 404) throw new SmithsonianError("Not found.")
  if (!res.ok) throw new SmithsonianError(`Smithsonian error ${res.status}`)
  return (await res.json()) as T
}

export interface SiObject {
  id?: string
  title?: string
  type?: string
  date?: string
  image?: string
}

export async function searchObjects(query: string, limit = 5): Promise<SiObject[]> {
  if (!query.trim()) throw new SmithsonianError("Query is empty.")
  const qs = new URLSearchParams({ q: query.trim(), rows: String(Math.min(Math.max(limit, 1), 100)) }).toString()
  const data = await getJson<Raw>(`/search?${qs}`)
  const resp: Raw = data.response ?? {}
  const rows: Raw[] = Array.isArray(resp.rows) ? resp.rows : []
  return rows.slice(0, limit).map((r) => {
    const content: Raw = r.content ?? {}
    const descr: Raw = content.descriptiveNonRepeating ?? {}
    const freetext: Raw = content.freetext ?? {}
    const media: Raw[] = Array.isArray(content.media) ? content.media : []
    return {
      id: r.id,
      title: descr.title?.content ?? freetext.title?.content?.[0]?.content,
      type: descr.data_classification?.[0]?.content ?? descr.object_type?.[0]?.content,
      date: freetext.date?.content,
      image: media[0]?.thumbnail ?? media[0]?.content,
    }
  })
}

export function formatObject(o: SiObject, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${o.id ?? "?"}] ${o.title ?? "(untitled)"}${o.type ? ` (${o.type})` : ""}${o.date ? ` — ${o.date}` : ""}${o.image ? `\n   ${o.image}` : ""}`
}
