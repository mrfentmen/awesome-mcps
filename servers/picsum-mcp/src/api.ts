const BASE = 'https://picsum.photos/v2/list';

export interface ListArgs {
  limit?: number;
}

export async function list(args: ListArgs = {}): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const res = await fetch(`${BASE}?page=1&limit=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-picsum-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Picsum returned ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  if (!rows.length) return 'No Picsum photos available.';
  return `Picsum photos (${rows.length} shown):\n` +
    rows
      .map((p, i) => `${i + 1}. ${p.author ?? 'unknown'} | ${p.width ?? ''}x${p.height ?? ''} | ${p.download_url ?? ''}`)
      .join('\n');
}
