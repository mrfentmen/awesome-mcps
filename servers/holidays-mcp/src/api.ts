const BASE = "https://date.nager.at/api/v3"
const UA = "mrfentmen-holidays-mcp/1.0 (https://github.com/mrfentmen)"
export class HolidaysError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new HolidaysError(`Nager.Date error ${res.status}`)
  return (await res.json()) as T
}

export async function publicHolidays(args: { year?: number; country?: string }): Promise<string> {
  const year = args.year ?? new Date().getFullYear()
  const country = (args.country ?? "US").toUpperCase()
  const rows = await get<any[]>(`${BASE}/PublicHolidays/${year}/${country}`)
  return rows.map((h: any) =>
    `${h.date ?? ""} | ${h.localName ?? h.name ?? ""}${h.global ? " (nationwide)" : ""}`
  ).join("\n") || "No holidays found"
}

export async function nextHolidays(args: { country?: string; limit?: number }): Promise<string> {
  const country = (args.country ?? "US").toUpperCase()
  const limit = Math.min(args.limit ?? 8, 20)
  const rows = await get<any[]>(`${BASE}/NextPublicHolidays/${country}`)
  return rows.slice(0, limit).map((h: any) =>
    `${h.date ?? ""} | ${h.localName ?? h.name ?? ""}`
  ).join("\n") || "No upcoming holidays found"
}
