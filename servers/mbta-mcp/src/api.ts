const UA = 'mrfentmen-mbta-mcp/1.0';

export interface RoutesArgs {
  limit?: number;
}

export async function routes(args: RoutesArgs): Promise<string> {
  const limit = Math.min(Math.max(Number(args?.limit ?? 10) || 10, 1), 50);
  const res = await fetch(`https://api-v3.mbta.com/routes?page%5Blimit%5D=${limit}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`MBTA returned ${res.status}`);
  const d = (await res.json()) as { data?: Array<{ id?: string; attributes?: { long_name?: string; short_name?: string; type?: number; color?: string; description?: string } }> };
  const list = d.data ?? [];
  if (!list.length) return 'No routes returned.';
  const typeName = (t: number | undefined) => ({ 0: 'Light rail', 1: 'Heavy rail', 2: 'Commuter rail', 3: 'Bus', 4: 'Ferry' }[t ?? -1] ?? `type ${t}`);
  return `MBTA routes (${list.length}):\n` +
    list.slice(0, limit).map((r, i) => `${i + 1}. ${r.attributes?.short_name ?? '?'} - ${r.attributes?.long_name ?? '?'} (${typeName(r.attributes?.type)}) #${r.id ?? '?'}`).join('\n');
}
