const BASE = 'https://fakestoreapi.com';
const UA = 'mrfentmen-fakestoreapi-mcp/1.0';

export interface ProductsArgs {
  limit?: number;
}

export interface ProductArgs {
  id: number;
}

export async function products(args: ProductsArgs): Promise<string> {
  const limit = Math.min(Math.max(Number(args?.limit ?? 10) || 10, 1), 20);
  const res = await fetch(`${BASE}/products?limit=${limit}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`FakeStoreAPI returned ${res.status}`);
  const d = (await res.json()) as Array<{ id?: number; title?: string; price?: number; category?: string }>;
  if (!Array.isArray(d) || !d.length) return 'No products returned.';
  return `FakeStoreAPI products (${d.length}):\n` +
    d.map((p, i) => `${i + 1}. ${p.title ?? '?'} - $${p.price ?? '?'} [${p.category ?? '?'}]`).join('\n');
}

export async function product(args: ProductArgs): Promise<string> {
  const id = Number(args.id);
  if (!Number.isFinite(id) || id <= 0) return 'Provide a product id.';
  const res = await fetch(`${BASE}/products/${id}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`FakeStoreAPI returned ${res.status}`);
  const d = (await res.json()) as { id?: number; title?: string; price?: number; category?: string; description?: string; image?: string; rating?: { rate?: number; count?: number } };
  return [
    `Product #${d.id ?? id}`,
    `Title: ${d.title ?? '?'}`,
    `Price: $${d.price ?? '?'} | Category: ${d.category ?? '?'}`,
    d.description ? `Description: ${d.description}` : null,
    d.rating ? `Rating: ${d.rating.rate ?? '?'}/5 (${d.rating.count ?? '?'} votes)` : null,
    d.image ? `Image: ${d.image}` : null,
  ].filter(Boolean).join('\n');
}

export async function categories(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/products/categories`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`FakeStoreAPI returned ${res.status}`);
  const d = (await res.json()) as string[];
  if (!Array.isArray(d) || !d.length) return 'No categories returned.';
  return `FakeStoreAPI categories:\n${d.map((c, i) => `${i + 1}. ${c}`).join('\n')}`;
}
