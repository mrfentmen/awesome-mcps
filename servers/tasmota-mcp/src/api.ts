/**
 * Tasmota HTTP API client. Points at one device via TASMOTA_URL
 * (default http://localhost). Optional TASMOTA_USER + TASMOTA_PASSWORD
 * for devices with web password set.
 * Docs: https://tasmota.github.io/docs/Commands/
 */
const BASE = (process.env.TASMOTA_URL ?? "http://localhost").replace(/\/+$/, "")

export class TasmotaError extends Error {}

function authSuffix(): string {
  if (process.env.TASMOTA_USER && process.env.TASMOTA_PASSWORD) {
    return `&user=${encodeURIComponent(process.env.TASMOTA_USER)}&password=${encodeURIComponent(process.env.TASMOTA_PASSWORD)}`
  }
  return ""
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function command<T>(cmnd: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}/cm?cmnd=${encodeURIComponent(cmnd)}${authSuffix()}`, {
      headers: { "User-Agent": "tasmota-mcp/1.0", Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new TasmotaError(`Tasmota at ${BASE} is unreachable. Set TASMOTA_URL.`)
  }
  if (res.status === 401 || res.status === 403) throw new TasmotaError("Tasmota refused (401/403). Check user/password.")
  if (!res.ok) throw new TasmotaError(`Tasmota error ${res.status}`)
  return (await res.json()) as T
}

export async function fullStatus(): Promise<string> {
  const d = await command<Raw>("Status 0")
  const net = (d.StatusNET ?? {}) as Raw
  const sts = (d.StatusSTS ?? {}) as Raw
  const prm = (d.StatusPRM ?? {}) as Raw
  const lines = [
    `Device: ${d.Status?.DeviceName ?? "?"} (${d.Status?.Hostname ?? "?"})`,
    `Firmware: ${sts.Version ?? prm.StartupUTC ?? "?"}`.replace("Firmware: ?", "Firmware: ?"),
    `Power: ${sts.POWER ?? "?"}`,
    `Uptime: ${sts.Uptime ?? "?"}`,
    `Wifi: ${net.Hostname ?? "?"} (${net.RSSI ?? "?"} dBm)`,
    `Topic: ${prm.MqttFullTopic ?? d.Status?.Topic ?? "?"}`,
  ]
  return lines.join("\n")
}

export async function setPower(state: "on" | "off" | "toggle", outlet = 1): Promise<string> {
  const cmd = outlet > 1 ? `Power${outlet} ${state}` : `Power ${state}`
  const d = await command<Raw>(cmd)
  const key = outlet > 1 ? `POWER${outlet}` : "POWER"
  return `Power is now ${d[key] ?? state.toUpperCase()}.`
}

export async function readSensor(): Promise<string> {
  const d = await command<Raw>("Status 8")
  const sns = (d.StatusSNS ?? {}) as Raw
  if (Object.keys(sns).length === 0) return "No sensors reporting."
  const lines = Object.entries(sns).slice(0, 10).map(([k, v]) => {
    if (v && typeof v === "object") {
      const inner = Object.entries(v as Raw).map(([ik, iv]) => `${ik}=${String(iv)}`).join(", ")
      return `${k}: ${inner}`
    }
    return `${k}: ${String(v)}`
  })
  return lines.join("\n")
}
