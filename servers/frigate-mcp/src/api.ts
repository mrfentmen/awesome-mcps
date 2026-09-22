/**
 * Frigate NVR HTTP API client. Points at any instance via FRIGATE_URL
 * (default http://localhost:5000). No auth by default; if behind a
 * proxy, set FRIGATE_USER + FRIGATE_PASSWORD (basic auth).
 * Docs: https://docs.frigate.video/integrations/api/
 */
const BASE = (process.env.FRIGATE_URL ?? "http://localhost:5000").replace(/\/+$/, "")

export class FrigateError extends Error {}

function headers(): Record<string, string> {
  const h: Record<string, string> = { "User-Agent": "frigate-mcp/1.0", Accept: "application/json" }
  if (process.env.FRIGATE_USER && process.env.FRIGATE_PASSWORD) {
    h.Authorization = `Basic ${Buffer.from(`${process.env.FRIGATE_USER}:${process.env.FRIGATE_PASSWORD}`).toString("base64")}`
  }
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
    throw new FrigateError(`Frigate at ${BASE} is unreachable. Set FRIGATE_URL.`)
  }
  if (res.status === 401 || res.status === 403) throw new FrigateError("Frigate refused (401/403). Check credentials.")
  if (res.status === 404) throw new FrigateError("Not found.")
  if (!res.ok) throw new FrigateError(`Frigate error ${res.status}`)
  return (await res.json()) as T
}

export async function serverVersion(): Promise<string> {
  const v = await getJson<Raw>("/api/version")
  return `Frigate ${String(v ?? "?")}`
}

export async function stats(): Promise<string> {
  const s = await getJson<Raw>("/api/stats")
  const cams: Raw = s.cameras ?? {}
  const names = Object.keys(cams)
  const det = (s.detectors ?? {}) as Raw
  const detNames = Object.keys(det)
  const lines = [
    `Uptime: ${s.service?.uptime !== undefined ? `${Math.round(Number(s.service.uptime) / 3600)}h` : "?"}`,
    `Cameras (${names.length}): ${names.join(", ") || "(none)"}`,
    `Detection FPS: ${s.detection_fps ?? "?"}`,
    detNames.length ? `Detectors: ${detNames.map((d) => `${d} (${(det[d] as Raw)?.inference_speed ?? "?"}ms)`).join(", ")}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}

export interface FrigateEvent {
  id: string
  camera?: string
  label?: string
  score?: number
  start?: string
  hasClip?: boolean
}

export async function recentEvents(camera = "", limit = 10): Promise<FrigateEvent[]> {
  const qs = new URLSearchParams({ limit: String(Math.min(Math.max(limit, 1), 100)) })
  if (camera.trim()) qs.set("cameras", camera.trim())
  const rows = await getJson<Raw[]>(`/api/events?${qs}`)
  return rows.slice(0, limit).map((e) => ({
    id: String(e.id),
    camera: e.camera,
    label: e.label,
    score: typeof e.top_score === "number" ? Math.round(e.top_score * 100) / 100 : undefined,
    start: e.start_time ? new Date(Number(e.start_time) * 1000).toISOString().slice(0, 16).replace("T", " ") : undefined,
    hasClip: e.has_clip,
  }))
}

export function formatEvent(e: FrigateEvent, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${e.id}] ${e.label ?? "event"} on ${e.camera ?? "?"}${e.score !== undefined ? ` (${e.score})` : ""}${e.start ? ` at ${e.start}` : ""}${e.hasClip ? " [clip]" : ""}`
}
