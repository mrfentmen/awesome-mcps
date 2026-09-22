/**
 * LIFX HTTP API client. Needs LIFX_TOKEN (free at https://cloud.lifx.com/settings).
 * Docs: https://api.developer.lifx.com/docs/introduction
 */
const BASE = "https://api.lifx.com/v1"

export class LifxError extends Error {}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  const token = process.env.LIFX_TOKEN
  if (!token) throw new LifxError("Set LIFX_TOKEN first (free at cloud.lifx.com/settings).")
  return { "User-Agent": "lifx-mcp/1.0", Accept: "application/json", Authorization: `Bearer ${token}`, ...extra }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: headers(),
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new LifxError("LIFX rejected the token (401/403).")
  if (!res.ok) throw new LifxError(`LIFX error ${res.status}`)
  return (await res.json()) as T
}

export interface Light {
  id: string
  label?: string
  power?: string
  brightness?: number
  connected?: boolean
  color?: string
}

export async function listLights(): Promise<Light[]> {
  const rows = await getJson<Raw[]>("/lights/all")
  return rows.map((l) => ({
    id: String(l.id),
    label: l.label,
    power: l.power,
    brightness: typeof l.brightness === "number" ? Math.round(l.brightness * 100) : undefined,
    connected: l.connected,
    color: l.color ? String(l.color.kelvin ? `${l.color.kelvin}K` : l.color.hue !== undefined ? `hue ${l.color.hue}` : "") || undefined : undefined,
  }))
}

export async function setPower(selector: string, power: "on" | "off" | "toggle", brightness = 1): Promise<string> {
  if (!selector.trim()) throw new LifxError("Selector is empty (use 'all', a label like 'label:Desk', or a group).")
  const res = await fetch(`${BASE}/lights/${encodeURIComponent(selector.trim())}/state`, {
    method: "PUT",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ power, brightness: Math.min(Math.max(brightness, 0), 1) }),
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new LifxError("LIFX rejected the token (401/403).")
  if (!res.ok) throw new LifxError(`LIFX error ${res.status}`)
  return `Set ${selector.trim()} ${power}.`
}

export function formatLight(l: Light, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${l.id}] ${l.label ?? "(unnamed)"} — ${l.power ?? "?"}${l.brightness !== undefined ? ` ${l.brightness}%` : ""}${l.color ? ` ${l.color}` : ""}${l.connected === false ? " (offline)" : ""}`
}
