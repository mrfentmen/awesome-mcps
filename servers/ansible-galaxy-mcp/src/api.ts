const BASE = "https://galaxy.ansible.com/api/v3"
const UA = "mrfentmen-ansible-galaxy-mcp/1.0 (https://github.com/mrfentmen)"
export class GalaxyError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new GalaxyError(`Ansible Galaxy returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function collections(args: { search?: string; limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 20)
  const search = (args.search ?? "").trim().toLowerCase()
  const d = await get<any>(`${BASE}/plugin/ansible/content/published/collections/index/?limit=100`)
  const list = (d?.data ?? []) as any[]
  let hits = list
  if (search) {
    hits = list.filter((c: any) => {
      const ns = String(c?.namespace?.name ?? "").toLowerCase()
      const name = String(c?.name ?? "").toLowerCase()
      const desc = String(c?.description ?? "").toLowerCase()
      return ns.includes(search) || name.includes(search) || desc.includes(search)
    })
  }
  const shown = hits.slice(0, limit)
  if (!shown.length) return search ? `No collections match \"${args.search}\"` : "No collections found"
  const head = search
    ? `Ansible collections matching \"${args.search}\" (${hits.length} in first 100):`
    : `Ansible collections (${d?.meta?.count ?? list.length} total, first ${shown.length} shown):`
  return head + "\n" + shown.map((c: any, i: number) => {
    const lv = c?.latest_version ?? {}
    const ns = c?.namespace?.name ?? ""
    const ver = lv?.version ?? "n/a"
    return `${i + 1}. ${ns}.${c?.name ?? "n/a"} v${ver}\n   ${(c?.description ?? "no description").slice(0, 140)}`
  }).join("\n")
}

export async function collection(args: { namespace?: string; name?: string }): Promise<string> {
  const ns = (args.namespace ?? "").trim()
  const name = (args.name ?? "").trim()
  if (!ns || !name) throw new GalaxyError("Provide both namespace and collection name")
  const c = await get<any>(`${BASE}/collections/${encodeURIComponent(ns)}/${encodeURIComponent(name)}/`)
  const lv = c?.latest_version ?? {}
  const lines = [
    `Collection: ${ns}.${name}`,
    `Latest version: ${lv?.version ?? "n/a"}`,
    `Published: ${lv?.created?.slice(0, 10) ?? "n/a"}`,
    `Description: ${(c?.description ?? "n/a").slice(0, 300)}`,
  ]
  const tags = (lv?.tags ?? []).slice(0, 8)
  if (tags.length) lines.push(`Tags: ${tags.join(", ")}`)
  if (lv?.download_count != null) lines.push(`Downloads: ${lv.download_count.toLocaleString()}`)
  return lines.join("\n")
}
