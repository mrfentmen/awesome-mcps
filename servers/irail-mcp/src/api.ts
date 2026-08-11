const UA = 'mrfentmen-irail-mcp/1.0';

export async function stations(_args?: unknown): Promise<string> {
  const res = await fetch('https://api.irail.be/v1/stations/?format=json', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`iRail returned ${res.status}`);
  const d = (await res.json()) as { station?: Array<{ '@id'?: string; name?: string; '@name'?: string; longitude?: number; latitude?: number }> };
  const list = d.station ?? [];
  if (!list.length) return 'No stations returned.';
  const rows = list.slice(0, 20).map((s, i) => `${i + 1}. ${s.name ?? s['@name'] ?? '?'} (${s['@id'] ?? '?'}) at ${s.latitude ?? '?'},${s.longitude ?? '?'}`);
  return `iRail stations (${list.length}, showing 20):\n${rows.join('\n')}`;
}

export interface ConnectionsArgs {
  from: string;
  to: string;
  limit?: number;
}

export async function connections(args: ConnectionsArgs): Promise<string> {
  const from = (args.from ?? '').trim();
  const to = (args.to ?? '').trim();
  if (!from || !to) return 'Provide origin and destination stations.';
  const limit = Math.min(Math.max(Number(args.limit ?? 3) || 3, 1), 10);
  const url = `https://api.irail.be/v1/connections/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&format=json&results=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`iRail returned ${res.status}`);
  const d = (await res.json()) as { connection?: Array<{ departure?: { time?: number; delay?: number; station?: string }; arrival?: { time?: number; delay?: number; station?: string } }> };
  const list = d.connection ?? [];
  if (!list.length) return `No connections from ${from} to ${to}.`;
  const fmt = (t: number | undefined) => (t ? new Date(t * 1000).toISOString() : '?');
  return `iRail connections ${from} -> ${to} (${list.length}):\n` +
    list.slice(0, limit).map((c, i) => `${i + 1}. dep ${fmt(c.departure?.time)}${c.departure?.delay ? ` (+${Math.round(Number(c.departure.delay) / 60)}min)` : ''} at ${c.departure?.station ?? '?'} -> arr ${fmt(c.arrival?.time)} at ${c.arrival?.station ?? '?'}`).join('\n');
}
