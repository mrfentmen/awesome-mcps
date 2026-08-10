const BASE = "https://proxy.golang.org"
const UA = "mrfentmen-go-proxy-mcp/1.0 (https://github.com/mrfentmen)"
export class GoproxyError extends Error {}

function encodeModule(path: string): string {
  return path.replace(/[A-Z]/g, (ch) => `!${ch.toLowerCase()}`)
}

async function get(url: string): Promise<Response> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new GoproxyError(`Go proxy returned HTTP ${res.status}`)
  return res
}

export async function latest(args: { module?: string }): Promise<string> {
  const mod = (args.module ?? "").trim()
  if (!mod) throw new GoproxyError("Provide a module path like github.com/gin-gonic/gin")
  const d = (await (await get(`${BASE}/${encodeModule(mod)}/@latest`)).json()) as { Version?: string; Time?: string }
  return `Module ${mod}:\n  Latest: ${d?.Version ?? "n/a"}\n  Published: ${d?.Time ? d.Time.slice(0, 10) : "n/a"}`
}

export async function versions(args: { module?: string; limit?: number }): Promise<string> {
  const mod = (args.module ?? "").trim()
  if (!mod) throw new GoproxyError("Provide a module path")
  const limit = Math.min(args.limit ?? 15, 50)
  const text = await (await get(`${BASE}/${encodeModule(mod)}/@v/list`)).text()
  const all = text.split("\n").filter(Boolean)
  const shown = all.slice(-limit)
  if (!shown.length) return `No versions found for ${mod}`
  return `Go module ${mod} (${all.length} versions, last ${shown.length}):\n` + shown.map((v, i) => `${i + 1}. ${v}`).join("\n")
}
