const UA = 'mrfentmen-upcitemdb-mcp/1.0';

export interface LookupArgs {
  upc: string;
}

export async function lookup(args: LookupArgs): Promise<string> {
  const upc = (args.upc ?? '').trim();
  if (!upc) return 'Provide a UPC/EAN code.';
  const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(upc)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`UPCitemdb returned ${res.status}`);
  const d = (await res.json()) as { code?: string; total?: number; items?: Array<{ ean?: string; title?: string; description?: string; brand?: string; category?: string; lowest_recorded_price?: number; highest_recorded_price?: number }> };
  const items = d.items ?? [];
  if (!items.length) return `No products found for ${upc}.`;
  const it = items[0];
  return [
    `UPCitemdb lookup for ${upc} (${d.total ?? 0} results):`,
    `Title: ${it.title ?? '?'}`,
    `Brand: ${it.brand ?? '?'} | Category: ${it.category ?? '?'}`,
    `Description: ${(it.description ?? '').slice(0, 160) || 'n/a'}`,
    `Price range: ${it.lowest_recorded_price ?? '?'} - ${it.highest_recorded_price ?? '?'} USD`,
  ].filter(Boolean).join('\n');
}
