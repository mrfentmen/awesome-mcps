const BASE = 'https://dogapi.dog/api/v2';

export interface FactsArgs {
  limit?: number;
}

export async function facts(args: FactsArgs = {}): Promise<string> {
  const n = Math.max(1, Math.min(args.limit ?? 1, 10));
  const res = await fetch(`${BASE}/facts?limit=${n}`, {
    headers: { 'User-Agent': 'mrfentmen-dog-facts-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`dogapi.dog returned ${res.status}`);
  const data = (await res.json()) as { data?: Array<{ id: string; attributes: { body: string } }> };
  const list = (data.data ?? []).map((f) => f.attributes.body).filter(Boolean);
  if (!list.length) return 'No dog facts available right now.';
  return list.map((f, i) => `${i + 1}. ${f}`).join('\n');
}
