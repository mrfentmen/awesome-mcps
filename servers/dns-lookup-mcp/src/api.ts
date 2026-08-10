const BASE = "https://dns.google/resolve"
const UA = "mrfentmen-dns-lookup-mcp/1.0 (https://github.com/mrfentmen)"
export class DnsError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new DnsError("DNS resolver rate limit hit, wait and retry")
  if (!res.ok) throw new DnsError(`DNS resolver error ${res.status}`)
  return (await res.json()) as T
}

function fmtAnswer(d: any, type: string): string {
  const ans = d?.Answer ?? []
  if (d?.Status === 3) return "Domain does not exist (NXDOMAIN)"
  if (!ans.length) return `No ${type} records found`
  return ans
    .map((a: any) => {
      const v = a?.data ?? ""
      const ttl = a?.TTL ?? "?"
      return `  ${v}  (ttl ${ttl})`
    })
    .join("\n")
}

export async function lookup(args: { domain?: string; type?: string }): Promise<string> {
  const domain = (args.domain ?? "").trim().toLowerCase()
  if (!domain) throw new DnsError("Provide a domain name")
  const type = (args.type ?? "A").trim().toUpperCase()
  const d = await get<any>(`${BASE}?name=${encodeURIComponent(domain)}&type=${type}`)
  return `${domain} ${type} records:\n${fmtAnswer(d, type)}`
}

export async function lookupAll(args: { domain?: string }): Promise<string> {
  const domain = (args.domain ?? "").trim().toLowerCase()
  if (!domain) throw new DnsError("Provide a domain name")
  const types = ["A", "AAAA", "MX", "NS", "TXT", "CNAME"]
  const out: string[] = []
  for (const t of types) {
    try {
      const d = await get<any>(`${BASE}?name=${encodeURIComponent(domain)}&type=${t}`)
      out.push(`${t}:\n${fmtAnswer(d, t)}`)
    } catch (e) {
      out.push(`${t}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  return out.join("\n\n")
}
