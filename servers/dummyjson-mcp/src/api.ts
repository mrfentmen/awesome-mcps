const BASE = 'https://dummyjson.com';

export interface ListArgs {
  limit?: number;
}

export async function products(args: ListArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/products?limit=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-dummyjson-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`DummyJSON returned ${res.status}`);
  const d = (await res.json()) as { products?: Array<Record<string, unknown>> };
  const rows = d.products ?? [];
  if (!rows.length) return 'No products returned.';
  return `Products (${rows.length} shown):\n` +
    rows.map((p, i) => {
      const s = (k: string) => (p[k] != null ? String(p[k]) : '');
      return `${i + 1}. ${s('title')} | $${s('price')} | ${s('category')}`;
    }).join('\n');
}

export async function recipes(args: ListArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/recipes?limit=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-dummyjson-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`DummyJSON returned ${res.status}`);
  const d = (await res.json()) as { recipes?: Array<Record<string, unknown>> };
  const rows = d.recipes ?? [];
  if (!rows.length) return 'No recipes returned.';
  return `Recipes (${rows.length} shown):\n` +
    rows.map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      return `${i + 1}. ${s('name')} | ${s('difficulty')} | ${s('prepTimeMinutes')}m prep`;
    }).join('\n');
}
