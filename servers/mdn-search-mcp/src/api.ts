const BASE = 'https://developer.mozilla.org/api/v1/search';

export interface SearchArgs {
  query: string;
  limit?: number;
}

interface MdnDoc {
  title?: string;
  summary?: string;
  mdn_url?: string;
  locale?: string;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const url = `${BASE}?q=${encodeURIComponent(q)}&locale=en-US&highlight=false&limit=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-mdn-search-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`MDN search returned ${res.status}`);
  const data = (await res.json()) as { documents?: MdnDoc[] };
  const rows = (data.documents ?? []).filter((d) => d && d.title);
  if (!rows.length) return `No MDN docs found for "${q}".`;
  return `MDN results for "${q}" (${rows.length} shown):\n` + rows.map((d, i) => `${i + 1}. ${d.title}\n   ${(d.summary ?? '').slice(0, 160)}${d.mdn_url ? `\n   https://developer.mozilla.org${d.mdn_url}` : ''}`).join('\n');
}
