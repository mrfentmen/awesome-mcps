const BASE = 'https://f-droid.org/api/v1';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(q)}&lang=en`, {
    headers: { 'User-Agent': 'mrfentmen-f-droid-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`F-Droid returned ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  if (!rows.length) return `No F-Droid apps found for "${q}".`;
  return `F-Droid apps for "${q}" (${rows.slice(0, limit).length} shown):\n` +
    rows
      .slice(0, limit)
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('packageName')} ${s('title')}${s('summary') ? ` | ${s('summary').slice(0, 80)}` : ''}`;
      })
      .join('\n');
}
