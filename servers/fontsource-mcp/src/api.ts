const BASE = 'https://api.fontsource.org/v1/fonts';

export interface ListArgs {
  search?: string;
  limit?: number;
}

export async function list(args: ListArgs = {}): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-fontsource-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Fontsource returned ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  const q = (args.search ?? '').trim().toLowerCase();
  const limit = Math.max(1, Math.min(args.limit ?? 20, 100));
  const filtered = q
    ? rows.filter((f) => String(f.id ?? f.family ?? '').toLowerCase().includes(q))
    : rows;
  const shown = filtered.slice(0, limit);
  if (!shown.length) return `No fonts match "${q}".`;
  return `Fontsource fonts (${shown.length} shown):\n` +
    shown.map((f, i) => `${i + 1}. ${f.id ?? f.family ?? 'unknown'}`).join('\n');
}
