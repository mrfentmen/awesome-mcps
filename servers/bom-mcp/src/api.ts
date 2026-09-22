export class BomError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BomError"
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

const UA = { "User-Agent": "awesome-mcps/1.0" }
const BASE = "https://api.weather.bom.gov.au"

function envStrict(name: string): string {
  const v = process.env[name]
  if (!v) throw new BomError(`Set the ${name} environment variable.`)
  return v
}

async function authHeaders(): Promise<Record<string, string>> {
  return {}
}

function encodeGeohash(lat: number, lon: number, precision = 7): string {
  const base32 = "0123456789bcdefghjkmnpqrstuvwxyz"
  let even = true
  let latMin = -90
  let latMax = 90
  let lonMin = -180
  let lonMax = 180
  let bit = 0
  let ch = 0
  let out = ""
  while (out.length < precision) {
    if (even) {
      const mid = (lonMin + lonMax) / 2
      if (lon >= mid) { ch = ch * 2 + 1; lonMin = mid } else { ch = ch * 2; lonMax = mid }
    } else {
      const mid = (latMin + latMax) / 2
      if (lat >= mid) { ch = ch * 2 + 1; latMin = mid } else { ch = ch * 2; latMax = mid }
    }
    even = !even
    bit++
    if (bit === 5) { out += base32[ch]; bit = 0; ch = 0 }
  }
  return out
}

function pretty(data: unknown): string {
  const t = typeof data === "string" ? data : JSON.stringify(data, null, 2)
  return t.length > 12000 ? t.slice(0, 12000) + "\n…(truncated)" : t
}

async function req(url: string, init: RequestInit = {}): Promise<unknown> {
  const res = await fetch(url, { headers: { ...UA, ...(await authHeaders()), ...(init.headers ?? {}) }, ...init })
  const ct = res.headers.get("content-type") ?? ""
  const data = ct.includes("json") ? await res.json() : await res.text()
  if (!res.ok) {
    const detail = typeof data === "string" ? data.slice(0, 300) : JSON.stringify(data).slice(0, 300)
    throw new BomError(`HTTP ${res.status}: ${detail}`)
  }
  return data
}

export async function getDailyForecast(lat: number, lon: number): Promise<string> {
  const gh = encodeGeohash(lat, lon);
  let url = BASE + `/v1/locations/${encodeURIComponent(String(gh))}/forecasts/daily`;
  const data = await req(url);
  return pretty(data);
}

export async function getHourlyForecast(lat: number, lon: number): Promise<string> {
  const gh = encodeGeohash(lat, lon);
  let url = BASE + `/v1/locations/${encodeURIComponent(String(gh))}/forecasts/hourly`;
  const data = await req(url);
  return pretty(data);
}

export async function getObservations(product: string, stationId: string): Promise<string> {
  let url = `http://www.bom.gov.au/fwo/${encodeURIComponent(String(product))}/${encodeURIComponent(String(product))}.${encodeURIComponent(String(stationId))}.json`;
  const data = await req(url);
  return pretty(data);
}
