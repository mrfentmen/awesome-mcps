const BASE = "https://celestrak.org/NORAD/elements/gp.php"
const UA = "mrfentmen-celestrak-mcp/1.0 (https://github.com/mrfentmen)"
export class CelestrakError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new CelestrakError(`CelesTrak returned HTTP ${res.status}`)
  return (await res.json()) as T
}

function fmtSat(s: any, i: number): string {
  const epoch = (s.EPOCH ?? "").replace(" ", "T")
  return `${i + 1}. ${s.OBJECT_NAME ?? "n/a"} | NORAD ${s.NORAD_CAT_ID ?? "n/a"} | ${s.OBJECT_ID ?? "n/a"}\n   Epoch ${epoch || "n/a"} | Inc ${s.INCLINATION ?? "n/a"} | Ecc ${s.ECCENTRICITY ?? "n/a"} | Period ${s.PERIOD ?? "n/a"} min | Mean motion ${s.MEAN_MOTION ?? "n/a"}`
}

export async function group(args: { group?: string; limit?: number }): Promise<string> {
  const g = (args.group ?? "stations").trim()
  const limit = Math.min(args.limit ?? 10, 30)
  const d = await get<any[]>(`${BASE}?GROUP=${encodeURIComponent(g)}&FORMAT=json`)
  const sats = (d ?? []).slice(0, limit)
  if (!sats.length) return `No satellites found in group ${g}. Try stations, visual, active, or weather.`
  return `Group ${g} (showing ${sats.length}):\n` + sats.map(fmtSat).join("\n")
}

export async function satellite(args: { noradId?: number }): Promise<string> {
  const id = Number(args.noradId)
  if (!Number.isInteger(id) || id <= 0) throw new CelestrakError("Provide a positive NORAD catalog number")
  const d = await get<any[]>(`${BASE}?CATNR=${id}&FORMAT=json`)
  const s = (d ?? [])[0]
  if (!s) return `No satellite found for NORAD ${id}`
  return fmtSat(s, 0)
}
