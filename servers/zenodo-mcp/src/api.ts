const BASE = "https://zenodo.org/api"
const UA = "mrfentmen-zenodo-mcp/1.0 (https://github.com/mrfentmen)"
export class ZenodoError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new ZenodoError(`Zenodo returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new ZenodoError("Provide a search query")
  const limit = Math.min(args.limit ?? 10, 20)
  const d = await get<any>(`${BASE}/records?q=${encodeURIComponent(q)}&size=${limit}`)
  const hits = d?.hits?.hits ?? []
  if (!hits.length) return `No Zenodo records found for \"${q}\"`
  return `Zenodo results for \"${q}\" (${d?.hits?.total ?? hits.length} total):\n` + hits.map((r: any, i: number) => {
    const meta = r?.metadata ?? {}
    const title = meta?.title ?? "untitled"
    const creators = (meta?.creators ?? []).slice(0, 3).map((c: any) => c?.name).join(", ")
    const type = meta?.resource_type?.title ?? ""
    const date = r?.created ? r.created.slice(0, 10) : ""
    return `${i + 1}. [${r?.id ?? ""}] ${title}\n   ${creators || "unknown"} | ${type} | ${date}`
  }).join("\n")
}

export async function record(args: { id?: number }): Promise<string> {
  const id = Number(args.id)
  if (!Number.isInteger(id) || id <= 0) throw new ZenodoError("Provide a positive record ID")
  const r = await get<any>(`${BASE}/records/${id}`)
  if (!r?.id) throw new ZenodoError(`Record not found: ${id}`)
  const meta = r?.metadata ?? {}
  const lines = [
    `Record: ${r?.id}`,
    `Title: ${meta?.title ?? "n/a"}`,
    `Creators: ${(meta?.creators ?? []).map((c: any) => c?.name).join(", ") || "n/a"}`,
    `Type: ${meta?.resource_type?.title ?? "n/a"}`,
    `Published: ${meta?.publication_date ?? "n/a"}`,
  ]
  if (meta?.description) lines.push(`\n${meta.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 500)}`)
  if (r?.links?.self) lines.push(`\nURL: ${r.links.self}`)
  return lines.join("\n")
}
