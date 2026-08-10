const KEY = process.env.NASA_API_KEY || "DEMO_KEY"
const BASE = "https://api.nasa.gov/insight_weather"
const UA = "mrfentmen-mars-weather-mcp/1.0 (https://github.com/mrfentmen)"
export class MarsError extends Error {}

export async function latestWeather(_args: Record<string, never>): Promise<string> {
  let lastErr: unknown
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`${BASE}/?api_key=${KEY}&feedtype=json&ver=1.0`, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(30000),
      })
      if (res.status === 429 && attempt < 3) {
        await new Promise((r) => setTimeout(r, 10000 * (attempt + 1)))
        continue
      }
      if (!res.ok) {
        throw new MarsError(`NASA error ${res.status}${res.status === 429 ? " (rate limit, try later or set NASA_API_KEY)" : ""}`)
      }
      const d = await res.json()
      const sols = d.sol_keys ?? []
      const last = sols[sols.length - 1]
      if (!last) throw new MarsError("No Mars weather sols returned")
      const s = d[last] ?? {}
      const t = s.AT?.av
      const p = s.PRE?.av
      const ws = s.HWS?.av
      const wd = s.WD?.most_common?.compass_point
      return `Mars weather, sol ${last} (${s.First_UTC?.slice(0, 10) ?? ""} to ${s.Last_UTC?.slice(0, 10) ?? ""})\nAir temp: ${t ?? "n/a"} C\nPressure: ${p ? (p / 100).toFixed(2) : "n/a"} hPa\nWind speed: ${ws ?? "n/a"} m/s\nWind direction: ${wd ?? "n/a"}`
    } catch (e) {
      lastErr = e
      if (e instanceof MarsError) throw e
      if (attempt >= 3) throw lastErr
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
  throw lastErr
}
