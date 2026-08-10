const BASE = "http://ip-api.com/json"
const UA = "mrfentmen-ip-geo-mcp/1.0 (https://github.com/mrfentmen)"
export class IpError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new IpError(`ip-api error ${res.status}`)
  return (await res.json()) as T
}

function fmt(d: any): string {
  if (d.status === "fail") return `Lookup failed: ${d.message ?? "unknown"}`
  return [
    `IP: ${d.query ?? ""}`,
    `Location: ${d.city ?? ""}, ${d.regionName ?? ""} ${d.countryCode ?? ""}`,
    `Coords: ${d.lat ?? "?"}, ${d.lon ?? "?"}`,
    `Timezone: ${d.timezone ?? ""}`,
    `ISP: ${d.isp ?? ""}`,
    `Org: ${d.org ?? ""}`,
    `AS: ${d.as ?? ""}`,
  ].join("\n")
}

export async function lookup(args: { ip?: string }): Promise<string> {
  const ip = (args.ip ?? "").trim()
  if (!ip) throw new IpError("Provide an IP address")
  const d = await get<any>(`${BASE}/${encodeURIComponent(ip)}?fields=status,message,query,city,regionName,countryCode,lat,lon,timezone,isp,org,as`)
  return fmt(d)
}

export async function myIp(_args: Record<string, never>): Promise<string> {
  const d = await get<any>(`${BASE}?fields=status,message,query,city,regionName,countryCode,lat,lon,timezone,isp,org,as`)
  return fmt(d)
}
