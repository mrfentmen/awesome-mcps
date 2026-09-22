/**
 * Pi-hole API client (v6 REST). Points at any instance via PIHOLE_URL
 * (default http://localhost:80). Auth with PIHOLE_PASSWORD (web password)
 * or PIHOLE_APP_PASSWORD (Settings > Web interface > App password).
 * Docs: https://docs.pi-hole.net/api/
 */
const BASE = (process.env.PIHOLE_URL ?? "http://localhost:80").replace(/\/+$/, "")

export class PiholeError extends Error {}

let sid: string | null = null

async function session(): Promise<string> {
  if (sid) return sid
  const password = process.env.PIHOLE_PASSWORD ?? process.env.PIHOLE_APP_PASSWORD
  if (!password) throw new PiholeError("Set PIHOLE_PASSWORD (or PIHOLE_APP_PASSWORD).")
  const res = await fetch(`${BASE}/api/auth`, {
    method: "POST",
    headers: { "User-Agent": "pihole-mcp/1.0", "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new PiholeError(`Pi-hole login failed (${res.status}). Check URL and password.`)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await res.json()) as any
  const id = data?.session?.sid
  if (!id) throw new PiholeError("Pi-hole login returned no session.")
  sid = id
  return sid as string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "pihole-mcp/1.0", Accept: "application/json", sid: await session() },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) {
    sid = null
    throw new PiholeError("Pi-hole refused (401/403). Check password.")
  }
  if (res.status === 404) throw new PiholeError("Not found. Check PIHOLE_URL (needs Pi-hole v6+).")
  if (!res.ok) throw new PiholeError(`Pi-hole error ${res.status}`)
  return (await res.json()) as T
}

async function postJson<T>(path: string, body: Raw = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "User-Agent": "pihole-mcp/1.0", Accept: "application/json", "Content-Type": "application/json", sid: await session() },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) {
    sid = null
    throw new PiholeError("Pi-hole refused (401/403). Check password.")
  }
  if (!res.ok) throw new PiholeError(`Pi-hole error ${res.status}`)
  return (await res.json()) as T
}

export async function blockingStatus(): Promise<string> {
  const d = await getJson<Raw>("/api/dns/blocking")
  return `Blocking is ${d.blocking === true ? "ENABLED" : d.blocking === false ? "DISABLED" : String(d.blocking ?? "?")}${d.timer ? ` (timer: ${d.timer}s)` : ""}`
}

export async function setBlocking(enabled: boolean, seconds = 0): Promise<string> {
  await postJson<Raw>("/api/dns/blocking", { blocking: enabled, timer: seconds > 0 ? seconds : null })
  return seconds > 0
    ? `Blocking ${enabled ? "enabled" : "disabled"} for ${seconds}s.`
    : `Blocking ${enabled ? "enabled" : "disabled"}.`
}

export async function summaryStats(): Promise<string> {
  const d = await getJson<Raw>("/api/stats/summary")
  const q = (d.queries ?? {}) as Raw
  const lines = [
    `DNS queries (24h): ${(q.total ?? "?").toLocaleString?.() ?? q.total ?? "?"}`,
    `Blocked: ${(q.blocked ?? "?").toLocaleString?.() ?? q.blocked ?? "?"}${q.percent_blocked !== undefined ? ` (${q.percent_blocked}%)` : ""}`,
    `Blocklist size: ${(d.gravity?.domains_being_blocked ?? "?").toLocaleString?.() ?? d.gravity?.domains_being_blocked ?? "?"}`,
    `Clients: ${d.clients?.active ?? "?"}`,
  ]
  return lines.join("\n")
}
