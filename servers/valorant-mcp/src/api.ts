const BASE = "https://valorant-api.com/v1"
const UA = "mrfentmen-valorant-mcp/1.0 (https://github.com/mrfentmen)"
export class ValorantError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new ValorantError(`Valorant API returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function agents(args: { language?: string }): Promise<string> {
  const lang = (args.language ?? "en-US").trim()
  const d = await get<any>(`${BASE}/agents?language=${encodeURIComponent(lang)}`)
  const list = ((d?.data ?? []) as any[]).filter((a: any) => a?.isPlayableCharacter !== false)
  if (!list.length) return "No agents found"
  return `Valorant agents (${list.length}):\n` + list.map((a, i) => {
    const role = a?.role?.displayName ?? "no role"
    return `${i + 1}. ${a?.displayName ?? "n/a"} | ${role}\n   ${(a?.description ?? "").slice(0, 120)}`
  }).join("\n")
}

export async function agent(args: { uuid?: string; language?: string }): Promise<string> {
  const uuid = (args.uuid ?? "").trim()
  if (!uuid) throw new ValorantError("Provide an agent UUID")
  const lang = (args.language ?? "en-US").trim()
  const d = await get<any>(`${BASE}/agents/${encodeURIComponent(uuid)}?language=${encodeURIComponent(lang)}`)
  const a = d?.data
  if (!a) throw new ValorantError(`Agent not found: ${uuid}`)
  const lines = [
    `${a?.displayName ?? "n/a"} | ${a?.role?.displayName ?? ""}`,
    `${a?.description ?? ""}`,
  ]
  if (a?.abilities?.length) {
    lines.push("", "Abilities:")
    a.abilities.forEach((ab: any, i: number) => lines.push(`${i + 1}. ${ab?.displayName ?? ""}: ${(ab?.description ?? "").slice(0, 140)}`))
  }
  return lines.join("\n")
}

export async function maps(_args?: unknown): Promise<string> {
  const d = await get<any>(`${BASE}/maps`)
  const list = (d?.data ?? []) as any[]
  if (!list.length) return "No maps found"
  return `Valorant maps (${list.length}):\n` + list.map((m, i) => {
    const coords = m?.coordinates ?? "unknown"
    return `${i + 1}. ${m?.displayName ?? "n/a"} | coords ${coords}`
  }).join("\n")
}

export async function weapons(_args?: unknown): Promise<string> {
  const d = await get<any>(`${BASE}/weapons`)
  const list = (d?.data ?? []) as any[]
  if (!list.length) return "No weapons found"
  return `Valorant weapons (${list.length}):\n` + list.map((w, i) => {
    const cost = w?.shopData?.cost
    return `${i + 1}. ${w?.displayName ?? "n/a"} | ${w?.category ?? ""}${cost != null ? ` | ${cost} credits` : ""}`
  }).join("\n")
}
