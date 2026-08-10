const BASE = "https://vpic.nhtsa.dot.gov/api/vehicles"
const UA = "mrfentmen-vin-decoder-mcp/1.0 (https://github.com/mrfentmen)"
export class VinError extends Error {}

export async function decodeVin(args: { vin?: string }): Promise<string> {
  const vin = (args.vin ?? "").trim().toUpperCase()
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) throw new VinError("Provide a valid 17 character VIN")
  let res: Response
  try {
    res = await fetch(`${BASE}/DecodeVin/${vin}?format=json`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(45000),
    })
  } catch {
    // NHTSA can be slow; one retry
    res = await fetch(`${BASE}/DecodeVin/${vin}?format=json`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(45000),
    })
  }
  if (!res.ok) throw new VinError(`NHTSA error ${res.status}`)
  const d = await res.json()
  const rows = d.Results ?? []
  const pick = (name: string) => rows.find((r: any) => r.Variable === name)?.Value
  const year = pick("Model Year")
  const make = pick("Make")
  const model = pick("Model")
  const body = pick("Body Class")
  const engine = pick("Engine Model")
  const fuel = pick("Fuel Type Primary")
  const plant = pick("Plant City")
  const trim = pick("Trim")
  const parts = [
    `${year ?? "?"} ${make ?? "?"} ${model ?? "?"}${trim ? ` ${trim}` : ""}`,
    `Body: ${body ?? "n/a"}`,
    `Engine: ${engine ?? "n/a"}`,
    `Fuel: ${fuel ?? "n/a"}`,
    `Plant: ${plant ?? "n/a"}`,
  ]
  return parts.join("\n")
}
