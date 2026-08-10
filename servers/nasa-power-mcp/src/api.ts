const BASE = "https://power.larc.nasa.gov/api/temporal/daily/point"
const UA = "mrfentmen-nasa-power-mcp/1.0 (https://github.com/mrfentmen)"
const KNOWN = ["T2M", "T2M_MIN", "T2M_MAX", "PRECTOTCORR", "ALLSKY_SFC_SW_DWN", "ALLSKY_SRF_ALB", "WS2M", "RH2M", "PS"]
export class NasaPowerError extends Error {}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "")
}

export async function daily(args: {
  latitude?: number
  longitude?: number
  parameters?: string
  start?: string
  end?: string
}): Promise<string> {
  const lat = Number(args.latitude)
  const lon = Number(args.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new NasaPowerError("Provide valid latitude and longitude")
  const params = (args.parameters ?? "T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN")
    .split(",")
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean)
  const bad = params.filter((p) => !KNOWN.includes(p))
  if (bad.length) throw new NasaPowerError(`Unknown parameters: ${bad.join(", ")}`)
  const now = new Date()
  const endDate = new Date(now)
  endDate.setDate(endDate.getDate() + 7)
  const start = (args.start ?? ymd(new Date(now.getTime() - 7 * 86400000))).trim()
  const end = (args.end ?? ymd(endDate)).trim()
  if (!/^\d{8}$/.test(start) || !/^\d{8}$/.test(end)) throw new NasaPowerError("Dates must be YYYYMMDD")
  const url = `${BASE}?parameters=${encodeURIComponent(params.join(","))}&community=RE&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(45000),
  })
  if (!res.ok) throw new NasaPowerError(`NASA POWER returned HTTP ${res.status}`)
  const d = (await res.json()) as any
  const p = d?.properties?.parameter ?? {}
  const dates = Object.keys(p?.[params[0]] ?? {}).sort()
  if (!dates.length) throw new NasaPowerError("No data returned for those dates")
  const header = `NASA POWER daily at ${lat.toFixed(2)}, ${lon.toFixed(2)} (${params.join(", ")})`
  const rows = dates.map((dt) => {
    const vals = params.map((prm) => {
      const v = p?.[prm]?.[dt]
      return `${prm}=${v != null ? Number(v).toFixed(2) : "n/a"}`
    })
    return `${dt}: ${vals.join(" | ")}`
  })
  const shown = rows.length > 14 ? [...rows.slice(0, 14), `... and ${rows.length - 14} more days`] : rows
  return header + "\n" + shown.join("\n")
}
