const BASE = 'https://v6.bvg.transport.rest';
const UA = 'mrfentmen-berlin-bvg-mcp/1.0';

export interface StopsArgs {
  query: string;
  limit?: number;
}

export interface DeparturesArgs {
  id: string;
  limit?: number;
}

export async function stops(args: StopsArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide a stop name.';
  const limit = Math.min(Math.max(Number(args.limit ?? 10) || 10, 1), 20);
  const res = await fetch(`${BASE}/locations?query=${encodeURIComponent(query)}&results=${limit}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`transport.rest returned ${res.status}`);
  const d = (await res.json()) as Array<{ id?: string; name?: string; type?: string }>;
  if (!Array.isArray(d) || !d.length) return `No stops for "${query}".`;
  return `Berlin stops for "${query}":\n` +
    d.slice(0, limit).map((s, i) => `${i + 1}. ${s.name ?? '?'} (${s.type ?? '?'}) id=${s.id ?? '?'}`).join('\n');
}

export async function departures(args: DeparturesArgs): Promise<string> {
  const id = (args.id ?? '').trim();
  if (!id) return 'Provide a stop id.';
  const limit = Math.min(Math.max(Number(args.limit ?? 10) || 10, 1), 20);
  const res = await fetch(`${BASE}/stops/${encodeURIComponent(id)}/departures?duration=30`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`transport.rest returned ${res.status}`);
  const d = (await res.json()) as { departures?: Array<{ plannedWhen?: string; direction?: string; line?: { name?: string; mode?: string } }> };
  const departures = d.departures ?? [];
  if (!departures.length) return `No departures at ${id}.`;
  return `Departures at ${id} (next ${limit}):\n` +
    departures.slice(0, limit).map((x, i) => {
      const when = x.plannedWhen ? new Date(x.plannedWhen).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '?';
      return `${i + 1}. ${when} ${x.line?.name ?? '?'} ${x.line?.mode ?? ''} -> ${x.direction ?? '?'}`.trim();
    }).join('\n');
}
