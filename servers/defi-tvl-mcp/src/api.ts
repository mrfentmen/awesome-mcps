const BASE = "https://api.llama.fi"
const UA = "mrfentmen-defi-tvl-mcp/1.0 (https://github.com/mrfentmen)"
export class DefiError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new DefiError("DefiLlama rate limit hit, wait and retry")
  if (!res.ok) throw new DefiError(`DefiLlama error ${res.status}`)
  return (await res.json()) as T
}

function fmtUsd(v: number | undefined): string {
  if (v === undefined || v === null) return "n/a"
  return "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export async function topProtocols(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 50)
  const d = await get<any[]>(`${BASE}/protocols`)
  const rows = d
    .filter((p: any) => !p?.misrepresentedTokens)
    .sort((a: any, b: any) => (b?.tvl ?? 0) - (a?.tvl ?? 0))
    .slice(0, limit)
  if (!rows.length) return "No protocols returned"
  return rows.map((p: any, i: number) => `${i + 1}. ${p?.name ?? "n/a"} | ${fmtUsd(p?.tvl)} | chains: ${(p?.chains ?? []).slice(0, 4).join(", ") || "n/a"}`).join("\n")
}

export async function chainTvl(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 50)
  const d = await get<any[]>(`${BASE}/v2/chains`)
  const rows = [...d].sort((a: any, b: any) => (b?.tvl ?? 0) - (a?.tvl ?? 0)).slice(0, limit)
  if (!rows.length) return "No chains returned"
  return rows.map((c: any, i: number) => `${i + 1}. ${c?.name ?? "n/a"} | ${fmtUsd(c?.tvl)} | ${c?.tokenSymbol ?? ""}`).join("\n")
}

export async function protocolInfo(args: { protocol?: string }): Promise<string> {
  const slug = (args.protocol ?? "").trim().toLowerCase().replace(/ /g, "-")
  if (!slug) throw new DefiError("Provide a protocol slug")
  const d = await get<any>(`${BASE}/protocol/${encodeURIComponent(slug)}`)
  return `Protocol: ${d?.name ?? slug}\nCurrent TVL: ${fmtUsd(d?.tvl)}\nChains: ${(d?.chains ?? []).join(", ") || "n/a"}\nCategory: ${d?.category ?? "n/a"}\nDescription: ${d?.description ?? "n/a"}\nWebsite: ${d?.url ?? "n/a"}`
}
