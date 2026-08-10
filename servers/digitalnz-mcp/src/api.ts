const BASE = 'https://api.digitalnz.org/v3/records.json';
const UA = 'mrfentmen-digitalnz-mcp/1.0';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export interface RecordArgs {
  id: string;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide search terms.';
  const limit = Math.min(Math.max(Number(args.limit ?? 10) || 10, 1), 25);
  const url = `${BASE}?text=${encodeURIComponent(query)}&per_page=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`DigitalNZ returned ${res.status}`);
  const d = (await res.json()) as { search?: { result_count?: number; results?: Array<{ id?: string; title?: string; display_content_partner?: string; category?: string[] }> } };
  const results = d.search?.results ?? [];
  if (!results.length) return `No DigitalNZ results for "${query}".`;
  return `DigitalNZ results for "${query}" (total ${d.search?.result_count ?? results.length}):\n` +
    results.slice(0, limit).map((r, i) => `${i + 1}. ${r.title ?? '?'} [${r.display_content_partner ?? '?'}] id=${r.id ?? '?'}`).join('\n');
}

export async function record(args: RecordArgs): Promise<string> {
  const id = (args.id ?? '').trim();
  if (!id) return 'Provide a record id.';
  const url = `${BASE}?id=${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`DigitalNZ returned ${res.status}`);
  const d = (await res.json()) as { record?: { title?: string; description?: string; display_content_partner?: string; category?: string[]; date?: string[]; thumbnail_url?: string; landing_url?: string } };
  const r = d.record ?? {};
  return [
    `DigitalNZ record ${id}`,
    `Title: ${r.title ?? '?'}`,
    r.description ? `Description: ${r.description.slice(0, 400)}` : null,
    `Partner: ${r.display_content_partner ?? '?'}`,
    r.category?.length ? `Categories: ${r.category.join(', ')}` : null,
    r.date?.length ? `Dates: ${r.date.join(', ')}` : null,
    r.thumbnail_url ? `Thumbnail: ${r.thumbnail_url}` : null,
    r.landing_url ? `Link: ${r.landing_url}` : null,
  ].filter(Boolean).join('\n');
}
