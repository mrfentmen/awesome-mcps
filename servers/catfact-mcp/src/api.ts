const BASE = 'https://catfact.ninja';

export async function fact(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/fact`, {
    headers: { 'User-Agent': 'mrfentmen-catfact-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Cat Facts returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  return `Cat fact: ${String(d.fact ?? 'no fact')}`;
}

export async function breeds(args: { limit?: number }): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 20, 50));
  const res = await fetch(`${BASE}/breeds?limit=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-catfact-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Cat Facts returned ${res.status}`);
  const d = (await res.json()) as { data?: Array<Record<string, unknown>> };
  const rows = d.data ?? [];
  if (!rows.length) return 'No breeds returned.';
  return `Cat breeds (${rows.length} shown):\n` +
    rows.map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      return `${i + 1}. ${s('breed')} (${s('origin')})`;
    }).join('\n');
}
