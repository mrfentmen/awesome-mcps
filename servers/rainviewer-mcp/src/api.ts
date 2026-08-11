const m0 = (() => {
const UA = 'mrfentmen-rainviewer-mcp/1.0';

async function radar(_args?: unknown): Promise<string> {
  const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`RainViewer returned ${res.status}`);
  const d = (await res.json()) as { version?: string; generated?: number; host?: string; radar?: { past?: Array<{ time?: number }>; nowcast?: Array<{ time?: number }>; forecast?: Array<{ time?: number }> } };
  const radar = d.radar ?? {};
  const when = (t: number | undefined) => (t ? new Date(t * 1000).toISOString() : '?');
  return [
    `RainViewer radar (version ${d.version ?? '?'}):`,
    `Host: ${d.host ?? '?'}`,
    `Past frames: ${(radar.past ?? []).length} | nowcast: ${(radar.nowcast ?? []).length} | forecast: ${(radar.forecast ?? []).length}`,
    `Generated: ${when(d.generated)}`,
  ].filter(Boolean).join('\n');
}

return { radar };
})();

const m1 = (() => {
const UA = "mrfentmen-rain-radar-mcp/1.0 (https://github.com/mrfentmen)"

class RadarError extends Error {}

async function timeline(_args?: unknown): Promise<string> {
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

return { RadarError, timeline };
})();

export const RadarError = m1.RadarError;
export const radar = m0.radar;
export const timeline = m1.timeline;
export const m0_radar = m0.radar;
export const m1_timeline = m1.timeline;
export const m1_RadarError = m1.RadarError;
