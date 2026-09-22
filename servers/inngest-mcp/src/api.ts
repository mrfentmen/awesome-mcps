/**
 * Inngest API client. Event ingestion needs INNGEST_EVENT_KEY
 * (dashboard > Manage > Event Keys). App listing needs INNGEST_SIGNING_KEY.
 * Docs: https://www.inngest.com/docs/reference/
 */
const EVENT_BASE = process.env.INNGEST_EVENT_URL ?? "https://inn.gs"
const API_BASE = "https://api.inngest.com"

export class InngestError extends Error {}

function eventKey(): string {
  const k = process.env.INNGEST_EVENT_KEY
  if (!k) throw new InngestError("Set INNGEST_EVENT_KEY first (dashboard > Manage > Event Keys).")
  return k
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

export async function sendEvent(name: string, data: Raw): Promise<string> {
  if (!name.trim()) throw new InngestError("Event name is empty.")
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new InngestError("Event data must be a JSON object.")
  }
  const res = await fetch(`${EVENT_BASE}/e/${eventKey()}`, {
    method: "POST",
    headers: { "User-Agent": "inngest-mcp/1.0", "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim(), data }),
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new InngestError("Inngest rejected the event key (401/403).")
  if (!res.ok) throw new InngestError(`Inngest error ${res.status}`)
  const out = (await res.json()) as Raw
  const ids: Raw = out.ids ?? {}
  const idList = Object.values(ids).map(String).slice(0, 5)
  return idList.length ? `Event sent: ${idList.join(", ")}` : "Event sent."
}

export interface App {
  id?: string
  name?: string
  url?: string
}

export async function listApps(): Promise<App[]> {
  const key = process.env.INNGEST_SIGNING_KEY
  if (!key) throw new InngestError("Set INNGEST_SIGNING_KEY first (dashboard > Manage > Signing Key).")
  const res = await fetch(`${API_BASE}/v1/apps`, {
    headers: { "User-Agent": "inngest-mcp/1.0", Accept: "application/json", Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new InngestError("Inngest refused (401/403). Check INNGEST_SIGNING_KEY.")
  if (!res.ok) throw new InngestError(`Inngest error ${res.status}`)
  const data = (await res.json()) as Raw
  const rows: Raw[] = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
  return rows.slice(0, 20).map((a) => ({ id: a.id ?? a.app_id, name: a.name ?? a.title, url: a.url }))
}
