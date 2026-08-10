const BASE = "https://ll.thespacedevs.com/2.2.0"
const UA = "mrfentmen-space-launches-mcp/1.0 (https://github.com/mrfentmen)"
export class LaunchError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new LaunchError(`Launch Library error ${res.status}`)
  return (await res.json()) as T
}

function fmtLaunch(l: any): string {
  const name = l.name ?? ""
  const net = l.net ?? ""
  const status = l.status?.name ?? "unknown"
  const rocket = l.rocket?.configuration?.full_name ?? "unknown rocket"
  const pad = l.pad?.name ?? ""
  const loc = l.pad?.location?.name ?? ""
  const agency = l.launch_service_provider?.name ?? ""
  return `${net.slice(0, 16)} | ${name}\n  ${rocket} | ${status}\n  ${pad}${loc ? `, ${loc}` : ""}${agency ? ` | ${agency}` : ""}`
}

export async function upcomingLaunches(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 5, 15)
  const d = await get<any>(`${BASE}/launch/upcoming/?limit=${limit}`)
  const rows = d.results ?? []
  return rows.map(fmtLaunch).join("\n\n") || "No upcoming launches"
}

export async function nextLaunch(_args: Record<string, never>): Promise<string> {
  const d = await get<any>(`${BASE}/launch/upcoming/?limit=1`)
  const l = (d.results ?? [])[0]
  if (!l) throw new LaunchError("No upcoming launch found")
  return fmtLaunch(l)
}
