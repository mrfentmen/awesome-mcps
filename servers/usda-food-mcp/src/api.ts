const BASE = 'https://api.nal.usda.gov/fdc/v1/foods/search';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a food search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const url = `${BASE}?query=${encodeURIComponent(q)}&pageSize=${limit}&api_key=DEMO_KEY`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-usda-food-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`USDA returned ${res.status}`);
  const data = (await res.json()) as {
    totalHits?: number;
    foods?: Array<{ description?: string; brandOwner?: string; fdcId?: number }>;
  };
  const foods = data.foods ?? [];
  if (!foods.length) return `No USDA foods found for "${q}".`;
  return `USDA foods for "${q}" (${data.totalHits ?? foods.length} total, ${foods.length} shown):\n` +
    foods
      .map((f, i) => `${i + 1}. ${f.description ?? 'untitled'}${f.brandOwner ? ` | ${f.brandOwner}` : ''}${f.fdcId ? ` | fdc ${f.fdcId}` : ''}`)
      .join('\n');
}
