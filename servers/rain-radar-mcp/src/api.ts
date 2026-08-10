const UA = "mrfentmen-rain-radar-mcp/1.0 (https://github.com/mrfentmen)"

export class RadarError extends Error {}

export async function timeline(_args?: unknown): Promise<string> {
  const res = await fetch("https://api.rainviewer.com/public/weather-maps.json", {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new RadarError(`RainViewer returned HTTP ${res.status}`)
  const d = (await res.json()) as { version: string; generated: number; host: string; radar: { past: any[]; nowcast: any[] } }
  const past = d.radar?.past ?? []
  const nowcast = d.radar?.nowcast ?? []
  return [
    `Radar host: ${d.host}`,
    `Version: ${d.version}`,
    `Past frames: ${past.length}`,
    `Nowcast frames: ${nowcast.length}`,
    "",
    "Frame paths (append to host):",
    ...past.slice(0, 3).map((f, i) => `  past[${i}] ${f.path} at ${new Date(f.time * 1000).toISOString().slice(11, 16)}Z`),
    ...nowcast.slice(0, 3).map((f, i) => `  nowcast[${i}] ${f.path} at ${new Date(f.time * 1000).toISOString().slice(11, 16)}Z`),
  ].join("\n")
}
