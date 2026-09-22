/**
 * ecobee API client. Needs ECOBEE_API_KEY plus ECOBEE_REFRESH_TOKEN.
 * First-time setup (PIN flow, once):
 *   1. GET https://api.ecobee.com/authorize?response_type=ecobeePin&client_id=KEY&scope=smartRead
 *      -> shows an ecobeePin code; enter it at https://www.ecobee.com/consumerportal/ within 9 minutes.
 *   2. POST https://api.ecobee.com/token with grant_type=ecobeePin&code=PIN&client_id=KEY
 *      -> returns access_token + refresh_token. Save the refresh token as ECOBEE_REFRESH_TOKEN.
 * This server auto-refreshes the access token and caches it in memory.
 * Docs: https://www.ecobee.com/home/developer/api/documentation/v1/
 */
const BASE = "https://api.ecobee.com"

export class EcobeeError extends Error {}

let cached: { token: string; exp: number } | null = null

async function accessToken(): Promise<string> {
  const key = process.env.ECOBEE_API_KEY
  const refresh = process.env.ECOBEE_REFRESH_TOKEN
  if (!key || !refresh) {
    throw new EcobeeError("Set ECOBEE_API_KEY and ECOBEE_REFRESH_TOKEN first (see README PIN steps).")
  }
  if (cached && cached.exp > Date.now() + 60000) return cached.token
  const body = new URLSearchParams({ grant_type: "refresh_token", code: refresh, client_id: key })
  const res = await fetch(`${BASE}/token`, {
    method: "POST",
    headers: { "User-Agent": "ecobee-mcp/1.0", "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new EcobeeError(`ecobee token refresh failed (${res.status}). Re-do the PIN flow for a new refresh token.`)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await res.json()) as any
  if (!data.access_token) throw new EcobeeError("ecobee returned no access token.")
  cached = { token: data.access_token, exp: Date.now() + (data.expires_in ?? 3600) * 1000 }
  return cached.token
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "ecobee-mcp/1.0", Accept: "application/json", Authorization: `Bearer ${await accessToken()}` },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) {
    cached = null
    throw new EcobeeError("ecobee refused (401/403). Tokens may have expired; re-do the PIN flow.")
  }
  if (!res.ok) throw new EcobeeError(`ecobee error ${res.status}`)
  return (await res.json()) as T
}

export interface Thermostat {
  id: string
  name?: string
  model?: string
  tempF?: number
  humidity?: number
  mode?: string
  sensors: string[]
}

const f2c = (f?: number): string | undefined =>
  f === undefined ? undefined : `${f}°F (${Math.round(((f - 320) / 18) * 10) / 10}°C)`;

export async function listThermostats(): Promise<Thermostat[]> {
  // NOTE: thermostat selection goes in a JSON body, so this is a POST
  // even though it only reads (matches ecobee's documented API).
  const post = await fetch(`${BASE}/1/thermostat?format=json`, {
    method: "POST",
    headers: { "User-Agent": "ecobee-mcp/1.0", Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${await accessToken()}` },
    body: JSON.stringify({ selection: { selectionType: "registered", includeRuntime: true, includeSensors: true } }),
    signal: AbortSignal.timeout(20000),
  })
  if (!post.ok) throw new EcobeeError(`ecobee error ${post.status}`)
  const data = (await post.json()) as Raw
  const rows: Raw[] = Array.isArray(data.thermostatList) ? data.thermostatList : []
  return rows.map((t) => {
    const rt: Raw = t.runtime ?? {}
    const sensors: Raw[] = Array.isArray(t.remoteSensors) ? t.remoteSensors : []
    return {
      id: String(t.identifier),
      name: t.name,
      model: t.modelNumber,
      tempF: typeof rt.actualTemperature === "number" ? rt.actualTemperature / 10 : undefined,
      humidity: typeof rt.actualHumidity === "number" ? rt.actualHumidity : undefined,
      mode: rt.actualHeatCoolMode ?? t.settings?.hvacMode,
      sensors: sensors.map((s) => String(s.name ?? "?")).slice(0, 8),
    }
  })
}

export function formatThermostat(t: Thermostat, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  const lines = [
    `${prefix}[${t.id}] ${t.name ?? "(unnamed)"}${t.model ? ` (${t.model})` : ""}`,
    t.tempF !== undefined ? `Temp: ${f2c(t.tempF)}` : "",
    t.humidity !== undefined ? `Humidity: ${t.humidity}%` : "",
    t.mode ? `Mode: ${t.mode}` : "",
    t.sensors.length ? `Sensors: ${t.sensors.join(", ")}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}
