/**
 * Node-RED Admin HTTP API client. Points at any instance via NODERED_URL
 * (default http://localhost:1880). If adminAuth is on, set NODERED_TOKEN
 * (Bearer) — get one by logging into the editor once.
 * Docs: https://nodered.org/docs/api/admin/methods/
 */
const BASE = (process.env.NODERED_URL ?? "http://localhost:1880").replace(/\/+$/, "")

export class NodeRedError extends Error {}

function headers(): Record<string, string> {
  const h: Record<string, string> = { "User-Agent": "nodered-mcp/1.0", Accept: "application/json" }
  if (process.env.NODERED_TOKEN) h.Authorization = `Bearer ${process.env.NODERED_TOKEN as string}`
  return h
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: headers(),
      signal: AbortSignal.timeout(20000),
    })
  } catch {
    throw new NodeRedError(`Node-RED at ${BASE} is unreachable. Set NODERED_URL.`)
  }
  if (res.status === 401 || res.status === 403) throw new NodeRedError("Node-RED refused (401/403). Set NODERED_TOKEN.")
  if (res.status === 404) throw new NodeRedError("Not found.")
  if (!res.ok) throw new NodeRedError(`Node-RED error ${res.status}`)
  return (await res.json()) as T
}

export interface Flow {
  id: string
  label?: string
  nodes: number
  disabled?: boolean
}

export async function listFlows(): Promise<Flow[]> {
  const rows = await getJson<Raw[]>("/flows")
  return rows
    .filter((f) => f.type === "tab")
    .map((f) => ({ id: String(f.id), label: f.label, nodes: 0, disabled: f.disabled }))
}

export async function getFlow(id: string): Promise<Raw[]> {
  if (!id.trim()) throw new NodeRedError("Flow id is empty.")
  const nodes = await getJson<Raw[]>(`/flow/${encodeURIComponent(id.trim())}`)
  return Array.isArray(nodes) ? nodes : []
}

export function formatFlow(id: string, nodes: Raw[]): string {
  if (nodes.length === 0) return `Flow ${id}: no nodes.`
  const kinds: Record<string, number> = {}
  for (const n of nodes) kinds[String(n.type ?? "?")] = (kinds[String(n.type ?? "?")] ?? 0) + 1
  const top = Object.entries(kinds).sort((a, b) => b[1] - a[1]).slice(0, 8)
  return [`Flow ${id} (${nodes.length} nodes):`, ...top.map(([k, v]) => `- ${k} x${v}`)].join("\n")
}
