const UA = 'mrfentmen-bitcoiner-mcp/1.0';

export async function fees(_args?: unknown): Promise<string> {
  const res = await fetch('https://bitcoiner.live/api/fees/estimates/latest', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`bitcoiner.live returned ${res.status}`);
  const d = (await res.json()) as { timestamp?: number; estimates?: Record<string, { sat_per_vbyte?: number; total?: { usd?: number } }> };
  const est = d.estimates ?? {};
  const rows = Object.entries(est).map(([k, v]) => `${k} blocks: ${v?.sat_per_vbyte ?? '?'} sat/vB (~$${v?.total?.usd ?? '?'})`);
  return `Bitcoin fee estimates (${d.timestamp ? new Date(d.timestamp * 1000).toISOString() : 'now'}):\n` + rows.join('\n');
}
