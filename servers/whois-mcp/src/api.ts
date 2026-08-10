const RDAP = "https://rdap.org"
const UA = "mrfentmen-whois-mcp/1.0 (https://github.com/mrfentmen)"
export class WhoisError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new WhoisError(`RDAP returned HTTP ${res.status}`)
  return (await res.json()) as T
}

function dates(d: any): { created?: string; updated?: string; expires?: string } {
  const out: { created?: string; updated?: string; expires?: string } = {}
  const ev = (d?.events ?? []) as any[]
  const find = (t: string) => {
    const e = ev.find((x: any) => x?.eventAction === t)
    return e?.eventDate ? e.eventDate.slice(0, 10) : undefined
  }
  out.created = find("registration")
  out.updated = find("last changed")
  out.expires = find("expiration")
  return out
}

export async function domain(args: { domain?: string }): Promise<string> {
  const dname = (args.domain ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0]
  if (!dname || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(dname)) throw new WhoisError("Provide a valid domain like example.com")
  const d = await get<any>(`${RDAP}/domain/${encodeURIComponent(dname)}`)
  const t = dates(d)
  const ns = ((d?.nameservers ?? []) as any[]).map((n: any) => n?.ldhName ?? "").filter(Boolean)
  const status = ((d?.status ?? []) as any[]).slice(0, 6)
  const lines = [
    `Domain: ${d?.ldhName ?? dname}`,
    `Registrar: ${d?.entities?.find((e: any) => (e?.roles ?? []).includes("registrar"))?.vcardArray?.[1]?.find((v: any) => v[0] === "fn")?.[3] ?? "n/a"}`,
    `Created: ${t.created ?? "n/a"}`,
    `Updated: ${t.updated ?? "n/a"}`,
    `Expires: ${t.expires ?? "n/a"}`,
  ]
  if (ns.length) lines.push(`Nameservers: ${ns.join(", ")}`)
  if (status.length) lines.push(`Status: ${status.join(", ")}`)
  return lines.join("\n")
}

export async function ip(args: { ip?: string }): Promise<string> {
  const addr = (args.ip ?? "").trim()
  if (!addr) throw new WhoisError("Provide an IP address")
  const d = await get<any>(`${RDAP}/ip/${encodeURIComponent(addr)}`)
  const range = d?.startAddress && d?.endAddress ? `${d.startAddress} - ${d.endAddress}` : addr
  const lines = [
    `IP: ${addr}`,
    `Range: ${range}`,
    `Name: ${d?.name ?? "n/a"}`,
    `Country: ${d?.country ?? "n/a"}`,
    `Handle: ${d?.handle ?? "n/a"}`,
  ]
  const org = d?.entities?.find((e: any) => (e?.roles ?? []).includes("registrant") || (e?.roles ?? []).includes("holder"))
  if (org) {
    const fn = org?.vcardArray?.[1]?.find((v: any) => v[0] === "fn")?.[3]
    if (fn) lines.push(`Organization: ${fn}`)
  }
  return lines.join("\n")
}
