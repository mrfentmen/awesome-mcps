const BASE = "https://crates.io/api/v1"
const UA = "mrfentmen-crates-io-mcp/1.0 (https://github.com/mrfentmen)"
export class CratesError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new CratesError("crates.io rate limit hit, wait and retry")
  if (!res.ok) throw new CratesError(`crates.io error ${res.status}`)
  return (await res.json()) as T
}

export async function crateInfo(args: { name?: string }): Promise<string> {
  const name = (args.name ?? "").trim().toLowerCase()
  if (!name) throw new CratesError("Provide a crate name")
  const d = await get<any>(`${BASE}/crates/${encodeURIComponent(name)}`)
  const c = d?.crate
  if (!c) throw new CratesError("Crate not found")
  return `Crate: ${c.name}\nDescription: ${c.description ?? "n/a"}\nLatest version: ${c.max_version ?? "n/a"}\nDownloads: ${(c.downloads ?? 0).toLocaleString()} (recent: ${(c.recent_downloads ?? 0).toLocaleString()})\nUpdated: ${c.updated_at ? new Date(c.updated_at).toISOString().slice(0, 10) : "n/a"}\nHomepage: ${c.homepage ?? c.repository ?? "n/a"}`
}

export async function searchCrates(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new CratesError("Provide search terms")
  const limit = Math.min(args.limit ?? 10, 30)
  const d = await get<any>(`${BASE}/crates?q=${encodeURIComponent(q)}&per_page=${limit}`)
  const crates = d?.crates ?? []
  if (!crates.length) return "No crates found"
  return crates.map((c: any, i: number) => `${i + 1}. ${c.name} ${c.max_version ?? ""}\n   ${(c.description ?? "").slice(0, 120)} | ${(c.downloads ?? 0).toLocaleString()} downloads`).join("\n\n")
}
