const BASE = "https://api.jolpi.ca/ergast/f1"
const UA = "mrfentmen-formula1-mcp/1.0 (https://github.com/mrfentmen)"
export class F1Error extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new F1Error("F1 API rate limit hit, wait and retry")
  if (!res.ok) throw new F1Error(`F1 API error ${res.status}`)
  return (await res.json()) as T
}

export async function lastRace(args: Record<string, never>): Promise<string> {
  const d = await get<any>(`${BASE}/current/last/results/?format=json`)
  const race = d?.MRData?.RaceTable?.Races?.[0]
  if (!race) return "No race data"
  const results = (race.Results ?? []).slice(0, 10).map((r: any, i: number) => {
    const d2 = r?.Driver ?? {}
    const t = r?.Time?.time ?? ""
    return `${i + 1}. ${d2.givenName} ${d2.familyName} (${d2.code ?? ""})${t ? ` ${t}` : ""}`
  })
  return `Race: ${race.raceName} | ${race.Circuit?.circuitName ?? ""}\nDate: ${race.date ?? ""}\n\n${results.join("\n")}`
}

export async function driverStandings(args: Record<string, never>): Promise<string> {
  const d = await get<any>(`${BASE}/current/driverstandings/?format=json`)
  const standings = d?.MRData?.StandingsTable?.StandingsLists?.[0]
  if (!standings) return "No standings data"
  return (standings.DriverStandings ?? []).slice(0, 10).map((s: any, i: number) => {
    const dr = s?.Driver ?? {}
    return `${i + 1}. ${dr.givenName} ${dr.familyName} | ${s.points} pts | ${s.wins} wins | team ${s.Constructors?.[0]?.name ?? "n/a"}`
  }).join("\n")
}

export async function seasonSchedule(args: { season?: number }): Promise<string> {
  const season = args.season ?? "current"
  const d = await get<any>(`${BASE}/${season}/races/?format=json&limit=30`)
  const races = d?.MRData?.RaceTable?.Races ?? []
  if (!races.length) return "No schedule data"
  return races.map((r: any) => `${r.round}. ${r.raceName} | ${r.date ?? ""} | ${r.Circuit?.circuitName ?? ""}`).join("\n")
}
