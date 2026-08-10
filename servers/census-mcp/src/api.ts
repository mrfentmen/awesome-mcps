const KEY = process.env.CENSUS_API_KEY
export class CensusError extends Error {}

async function request<T>(path: string): Promise<T> {
  if (!KEY) throw new CensusError("Set the CENSUS_API_KEY environment variable to your free Census API key")
  const res = await fetch(`https://api.census.gov${path}&key=${KEY}`, { signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new CensusError(`Census error ${res.status}`)
  return (await res.json()) as T
}

function formatTable(rows: string[][]): string {
  return rows.slice(1).map((r) => `${r[0]}: ${Number(r[1] ?? 0).toLocaleString()}`).join("\n")
}

export async function nationPopulation(_args: Record<string, never>): Promise<string> {
  const rows = await request<string[][]>("/data/2022/acs/acs5?get=NAME,B01001_001E&for=us:1")
  return `US population\n${formatTable(rows)}`
}

export async function statePopulation(args: { state?: string }): Promise<string> {
  const st = args.state ?? ""
  const rows = await request<string[][]>(`/data/2022/acs/acs5?get=NAME,B01001_001E&for=state:${st}`)
  return `State population\n${formatTable(rows)}`
}

export async function countyPopulation(args: { state?: string }): Promise<string> {
  const st = args.state ?? ""
  const rows = await request<string[][]>(`/data/2022/acs/acs5?get=NAME,B01001_001E&for=county:*&in=state:${st}`)
  const lines = rows.slice(1).sort((a, b) => Number(b[1] ?? 0) - Number(a[1] ?? 0)).slice(0, 25)
  return `Top counties in state ${st}\n${lines.map((r) => `${r[0]}: ${Number(r[1] ?? 0).toLocaleString()}`).join("\n")}`
}
