const BASE = "https://rdap.org"
const UA = "mrfentmen-domain-info-mcp/1.0 (https://github.com/mrfentmen)"
export class DomainError extends Error {}

export async function domainInfo(args: { domain?: string }): Promise<string> {
  const domain = (args.domain ?? "").trim().toLowerCase()
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) throw new DomainError("Provide a valid domain like example.com")
  const res = await fetch(`${BASE}/domain/${encodeURIComponent(domain)}`, {
    headers: { "User-Agent": UA, Accept: "application/rdap+json" },
    redirect: "follow",
    signal: AbortSignal.timeout(25000),
  })
  if (res.status === 404) throw new DomainError(`No RDAP data for ${domain}`)
  if (!res.ok) throw new DomainError(`RDAP error ${res.status}`)
  const d = await res.json()
  const ns = (d.nameservers ?? []).map((n: any) => n.ldhName ?? n.fqdn ?? "").join(", ")
  const status = (d.status ?? []).join(", ")
  const events: Record<string, string> = {}
  for (const e of d.events ?? []) {
    if (e.eventAction && e.eventDate) events[e.eventAction] = String(e.eventDate).slice(0, 10)
  }
  const registrant = d.entities?.find((x: any) => x.roles?.includes("registrant"))?.vcardArray?.[1]
  const name = registrant?.find((r: any) => r[0] === "fn")?.[3] ?? "n/a"
  const handle = d.handle ?? ""
  return [
    `Domain: ${d.ldhName ?? domain}`,
    handle ? `Handle: ${handle}` : "",
    events.registration ? `Registered: ${events.registration}` : "",
    events.expiration ? `Expires: ${events.expiration}` : "",
    events.last_changed ? `Last changed: ${events.last_changed}` : "",
    status ? `Status: ${status}` : "",
    ns ? `Nameservers: ${ns}` : "",
    `Registrant: ${name}`,
  ].filter(Boolean).join("\n")
}
