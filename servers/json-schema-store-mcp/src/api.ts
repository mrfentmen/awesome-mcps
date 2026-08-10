const BASE = 'https://www.schemastore.org/api/json/catalog.json';

export interface SchemaEntry {
  name: string;
  description?: string;
  url?: string;
}

export interface SearchArgs {
  query: string;
  limit?: number;
}

async function listSchemas(): Promise<SchemaEntry[]> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-json-schema-store-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`schemastore catalog returned ${res.status}`);
  const data = (await res.json()) as { schemas?: SchemaEntry[] };
  return (data.schemas ?? []).slice(0, 500);
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim().toLowerCase();
  if (!q) return 'Provide a search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 20, 50));
  const all = await listSchemas();
  const hits = all.filter((s) => `${s.name} ${s.description ?? ''}`.toLowerCase().includes(q)).slice(0, limit);
  if (!hits.length) return `No schemas in the store match "${q}".`;
  return `Schema Store matches for "${q}" (${hits.length} shown):\n` + hits.map((s, i) => `${i + 1}. ${s.name}\n   ${s.description ?? ''}`).join('\n');
}
