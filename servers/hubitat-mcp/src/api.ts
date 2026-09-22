/**
 * Hubitat Maker API client. Needs HUBITAT_URL (e.g. http://hubitat.local),
 * HUBITAT_APP_ID and HUBITAT_TOKEN (from the Maker API app instance).
 * Docs: https://docs2.hubitat.com/en/apps/maker-api
 */
function base(): string {
  const url = (process.env.HUBITAT_URL ?? "http://hubitat.local").replace(/\/+$/, "")
  const app = process.env.HUBITAT_APP_ID
  const token = process.env.HUBITAT_TOKEN
  if (!app || !token) throw new HubitatError("Set HUBITAT_URL, HUBITAT_APP_ID and HUBITAT_TOKEN (Maker API app).")
  return `${url}/apps/api/${app}`
}

export class HubitatError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const token = process.env.HUBITAT_TOKEN
  const res = await fetch(`${base()}${path}?access_token=${encodeURIComponent(token ?? "")}`, {
    headers: { "User-Agent": "hubitat-mcp/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new HubitatError("Hubitat refused (401/403). Check app id and token.")
  if (res.status === 404) throw new HubitatError("Not found. Check HUBITAT_URL and app id.")
  if (!res.ok) throw new HubitatError(`Hubitat error ${res.status}`)
  return (await res.json()) as T
}

export interface Device {
  id: string
  name?: string
  label?: string
  type?: string
}

export async function listDevices(): Promise<Device[]> {
  const rows = await getJson<Raw[]>("/devices")
  return rows.map((d) => ({ id: String(d.id), name: d.name, label: d.label, type: d.type }))
}

export async function deviceStatus(id: string): Promise<string> {
  if (!id.trim()) throw new HubitatError("Device id is empty.")
  const d = await getJson<Raw>(`/devices/${encodeURIComponent(id.trim())}`)
  const attrs: Raw[] = Array.isArray(d.attributes) ? d.attributes : []
  const lines = [
    `[${d.id}] ${d.label ?? d.name ?? "(unnamed)"}${d.type ? ` (${d.type})` : ""}`,
    ...attrs.slice(0, 10).map((a) => `${String(a.name)}: ${String(a.currentValue ?? "?")} ${String(a.unit ?? "")}`.trim()),
  ]
  return lines.join("\n")
}

export async function sendCommand(id: string, command: string, value = ""): Promise<string> {
  if (!id.trim() || !command.trim()) throw new HubitatError("Device id and command are required.")
  let path = `/devices/${encodeURIComponent(id.trim())}/${encodeURIComponent(command.trim())}`
  if (value.trim()) path += `/${encodeURIComponent(value.trim())}`
  await getJson<Raw>(path)
  return `Sent ${command}${value.trim() ? `(${value.trim()})` : ""} to device ${id.trim()}.`
}

export function formatDevice(d: Device, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${d.id}] ${d.label ?? d.name ?? "(unnamed)"}${d.type ? ` (${d.type})` : ""}`
}
