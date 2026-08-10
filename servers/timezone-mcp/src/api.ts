const BASE = "https://timeapi.io/api/Time/current/zone"
const UA = "mrfentmen-timezone-mcp/1.0 (https://github.com/mrfentmen)"
export class TimeError extends Error {}

const COMMON = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow", "Asia/Dubai",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Singapore", "Asia/Kolkata", "Australia/Sydney",
  "Pacific/Auckland", "America/Sao_Paulo", "Africa/Lagos",
]

export async function timeInZone(args: { timezone?: string }): Promise<string> {
  const tz = (args.timezone ?? "UTC").trim()
  if (!tz) throw new TimeError("Provide an IANA timezone")
  const res = await fetch(`${BASE}?timeZone=${encodeURIComponent(tz)}`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 404 || res.status === 400) throw new TimeError(`Unknown timezone ${tz}`)
  if (!res.ok) throw new TimeError(`Time API error ${res.status}`)
  const d = await res.json()
  return `${d.dateTime ?? ""} (${tz})\n${d.dayOfWeek ?? ""} | DST ${d.dstActive ? "active" : "inactive"} | UTC offset ${d.utcOffset ?? "?"}`
}

export async function listZones(_args: Record<string, never>): Promise<string> {
  return `Common IANA timezones\n${COMMON.join("\n")}`
}
