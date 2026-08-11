const UA = 'mrfentmen-warframe-mcp/1.0';

export async function state(_args?: unknown): Promise<string> {
  const res = await fetch('https://api.warframestat.us/pc', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`warframestat.us returned ${res.status}`);
  const d = (await res.json()) as {
    timestamp?: string;
    alerts?: Array<{ mission?: { node?: string; type?: string }; eta?: string }>;
    sortie?: { variant?: Array<{ missionType?: string }> };
    voidTrader?: { character?: string; active?: boolean };
    fissures?: Array<{ node?: string; missionType?: string; tier?: string }>;
  };
  const when = d.timestamp ? new Date(d.timestamp).toISOString() : '?';
  const alerts = (d.alerts ?? []).slice(0, 3).map((a) => `${a.mission?.node ?? '?'} (${a.mission?.type ?? '?'}) ends ${a.eta ?? '?'}`).join('\n');
  const fissures = (d.fissures ?? []).slice(0, 3).map((f) => `${f.tier ?? '?'} ${f.missionType ?? '?'} at ${f.node ?? '?'}`).join('\n');
  return [
    `Warframe state for PC (${when}):`,
    `Alerts (${(d.alerts ?? []).length}):`,
    alerts || '  none',
    `Void trader: ${d.voidTrader?.character ?? 'unknown'} (${d.voidTrader?.active ? 'active' : 'away'})`,
    `Fissures (showing 3):`,
    fissures || '  none',
  ].filter(Boolean).join('\n');
}
