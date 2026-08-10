const BASE = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
const UA = "mrfentmen-exoplanets-mcp/1.0 (https://github.com/mrfentmen)"
export class ExoplanetError extends Error {}

async function query<T>(sql: string): Promise<T> {
  const res = await fetch(`${BASE}?query=${encodeURIComponent(sql)}&format=json`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(30000) })
  if (res.status === 429) throw new ExoplanetError("Exoplanet Archive rate limit hit, wait and retry")
  if (!res.ok) throw new ExoplanetError(`Exoplanet Archive error ${res.status}`)
  return (await res.json()) as T
}

function fmt(p: any, i: number): string {
  const rad = p?.pl_rade !== undefined && p?.pl_rade !== null ? ` | radius ${p.pl_rade} Earth` : ""
  const orb = p?.pl_orbper !== undefined && p?.pl_orbper !== null ? ` | period ${p.pl_orbper} days` : ""
  const method = p?.discoverymethod ? ` | ${p.discoverymethod}` : ""
  return `${i + 1}. ${p?.pl_name ?? "Untitled"}${rad}${orb}${method}`
}

export async function recent(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 30)
  const d = await query<any[]>(`select top ${limit} pl_name,pl_rade,pl_orbper,discoverymethod from ps where default_flag=1 order by disc_pubdate desc`)
  if (!d?.length) return "No exoplanets returned"
  return d.map(fmt).join("\n")
}

export async function byName(args: { name?: string }): Promise<string> {
  const name = (args.name ?? "").trim()
  if (!name) throw new ExoplanetError("Provide an exoplanet name")
  const d = await query<any[]>(`select pl_name,pl_rade,pl_orbper,pl_orbperiod,pl_bmassj,pl_eqt,st_teff,st_rad,discoverymethod,disc_year,pl_pnum from ps where pl_name like '${name.replace(/'/g, "''")}%' and default_flag=1`)
  if (!d?.length) return `No exoplanet named ${name}`
  const p = d[0]
  const lines = [
    `Name: ${p.pl_name}`,
    p.pl_rade ? `Radius: ${p.pl_rade} Earth radii` : "",
    p.pl_orbperiod ? `Orbital period: ${p.pl_orbperiod} days` : "",
    p.pl_bmassj ? `Mass: ${p.pl_bmassj} Jupiter masses` : "",
    p.pl_eqt ? `Equilibrium temperature: ${p.pl_eqt} K` : "",
    p.discoverymethod ? `Discovered by: ${p.discoverymethod}` : "",
    p.disc_year ? `Discovery year: ${p.disc_year}` : "",
    p.st_teff ? `Host star temp: ${p.st_teff} K` : "",
    p.pl_pnum !== undefined ? `Planets in system: ${p.pl_pnum}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}
