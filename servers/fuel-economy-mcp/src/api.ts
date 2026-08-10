const BASE = "https://www.fueleconomy.gov/ws/rest/vehicle"
const UA = "mrfentmen-fuel-economy-mcp/1.0 (https://github.com/mrfentmen)"
export class FuelError extends Error {}

async function getText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new FuelError(`EPA error ${res.status}`)
  return res.text()
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new FuelError(`EPA error ${res.status}`)
  return (await res.json()) as T
}

function extract(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}>([^<]*)</${tag}>`, "g")
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) out.push(m[1])
  return out
}

export async function vehicleMpg(args: { make?: string; model?: string; year?: number }): Promise<string> {
  const make = (args.make ?? "").trim()
  const model = (args.model ?? "").trim()
  if (!make || !model || !args.year) throw new FuelError("Provide make, model, and year")
  const year = await getText(`${BASE}/menu/year`)
  const years = extract(year, "value")
  if (!years.includes(String(args.year))) throw new FuelError(`Year ${args.year} not in EPA data`)
  const makes = await getText(`${BASE}/menu/make?year=${args.year}`)
  const makeIds: Record<string, string> = {}
  const makeNames = extract(makes, "text")
  const makeVals = extract(makes, "value")
  makeNames.forEach((n, i) => { makeIds[n.toLowerCase()] = makeVals[i] ?? "" })
  const makeId = makeIds[make.toLowerCase()]
  if (!makeId) throw new FuelError(`Make ${make} not found for ${args.year}`)
  const models = await getText(`${BASE}/menu/model?year=${args.year}&make=${makeId}`)
  const modelNames = extract(models, "text")
  const modelVals = extract(models, "value")
  const mq = model.toLowerCase()
  const mi = modelNames.findIndex((n) => n.toLowerCase() === mq || n.toLowerCase().startsWith(mq))
  const modelId = modelVals[mi]
  if (!modelId) throw new FuelError(`Model ${model} not found for ${args.year} ${make}`)
  const options = await getText(`${BASE}/menu/options?year=${args.year}&make=${makeId}&model=${modelId}`)
  const ids = extract(options, "value")
  const optionTexts = extract(options, "text")
  const out: string[] = []
  for (let i = 0; i < Math.min(ids.length, 8); i++) {
    const v = await getText(`${BASE}/${ids[i]}`)
    const text = optionTexts[i] ?? ids[i]
    const city = extract(v, "city08")[0] ?? "?"
    const hwy = extract(v, "highway08")[0] ?? "?"
    const comb = extract(v, "comb08")[0] ?? "?"
    out.push(`${text}: ${comb} mpg combined (${city} city / ${hwy} highway)`)
  }
  return `${args.year} ${make} ${model}\n${out.join("\n") || "No trims found"}`
}
