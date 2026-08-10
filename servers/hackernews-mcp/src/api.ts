const BASE = 'https://hn.algolia.com/api/v1';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export interface TopArgs {
  limit?: number;
}

interface HnHit {
  title?: string;
  url?: string;
  points?: number;
  num_comments?: number;
  author?: string;
  created_at?: string;
  objectID?: string;
}

function formatHits(hits: HnHit[]): string {
  return hits
    .map((h, i) => `${i + 1}. ${h.title ?? 'untitled'} | ${h.points ?? 0} points | ${h.num_comments ?? 0} comments | ${h.author ?? ''} | ${(h.created_at ?? '').slice(0, 10)}${h.url ? `\n   ${h.url}` : ''}`)
    .join('\n');
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const res = await fetch(`${BASE}/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-hackernews-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Algolia returned ${res.status}`);
  const data = (await res.json()) as { hits?: HnHit[]; nbHits?: number };
  const hits = data.hits ?? [];
  if (!hits.length) return `No Hacker News stories found for "${q}".`;
  return `Hacker News results for "${q}" (${data.nbHits ?? hits.length} total, ${hits.length} shown):\n` + formatHits(hits);
}

export async function top(args: TopArgs = {}): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const res = await fetch(`${BASE}/search?tags=front_page&hitsPerPage=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-hackernews-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Algolia returned ${res.status}`);
  const data = (await res.json()) as { hits?: HnHit[] };
  const hits = data.hits ?? [];
  if (!hits.length) return 'No front page stories right now.';
  return `Hacker News front page (${hits.length} shown):\n` + formatHits(hits);
}
