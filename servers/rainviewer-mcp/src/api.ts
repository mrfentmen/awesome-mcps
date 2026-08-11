const UA = 'mrfentmen-rainviewer-mcp/1.0';

export async function radar(_args?: unknown): Promise<string> {
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
