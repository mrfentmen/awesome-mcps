const UA = 'mrfentmen-hacker-news-mcp/1.0 (https://github.com/mrfentmen)';
const FIREBASE_BASE = 'https://hacker-news.firebaseio.com/v0';
const ALGOLIA_BASE = 'https://hn.algolia.com/api/v1';
export class HnError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new HnError(`Hacker News returned HTTP ${res.status}`);
  return (await res.json()) as T;
}

interface Item {
  id: number;
  title?: string;
  url?: string;
  score?: number;
  by?: string;
  time?: number;
  descendants?: number;
  text?: string;
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

async function getItem(id: number): Promise<Item> {
  return get<Item>(`${FIREBASE_BASE}/item/${id}.json`);
}

async function list(ids: number[], limit: number): Promise<string> {
  const rows: string[] = [];
  for (const id of ids.slice(0, limit)) {
    try {
      const it = await getItem(id);
      if (it && it.title) {
        rows.push(`${it.id} | ${it.title} | points ${it.score ?? 0} | comments ${it.descendants ?? 0}${it.url ? '' : ' (text)'}`);
      }
    } catch {
      // skip failed item
    }
  }
  return rows.join('\n');
}

export async function top(args: { limit?: number }): Promise<string> {
  const ids = await get<number[]>(`${FIREBASE_BASE}/topstories.json`);
  return (await list(ids, Math.min(args.limit ?? 10, 30))) || 'No stories right now';
}

export async function jobs(args: { limit?: number }): Promise<string> {
  const ids = await get<number[]>(`${FIREBASE_BASE}/jobstories.json`);
  return (await list(ids, Math.min(args.limit ?? 10, 30))) || 'No jobs right now';
}

export async function ask(args: { limit?: number }): Promise<string> {
  const ids = await get<number[]>(`${FIREBASE_BASE}/askstories.json`);
  return (await list(ids, Math.min(args.limit ?? 10, 30))) || 'No ask threads right now';
}

export async function item(args: { id?: number }): Promise<string> {
  const id = args.id;
  if (id === undefined || !Number.isInteger(id)) throw new HnError('Provide an item ID');
  const it = await getItem(id);
  if (!it) throw new HnError(`Item ${id} not found`);
  return [
    `${it.title ?? 'untitled'} (id ${it.id})`,
    `By ${it.by ?? 'n/a'} at ${it.time ? new Date(it.time * 1000).toISOString().slice(0, 16).replace('T', ' ') : 'n/a'}`,
    `Points ${it.score ?? 0} | comments ${it.descendants ?? 0}`,
    it.url ? `Link: ${it.url}` : '',
    it.text ? `\n${it.text.slice(0, 1000)}` : '',
  ].filter(Boolean).join('\n');
}

function formatHits(hits: HnHit[]): string {
  return hits
    .map((h, i) => `${i + 1}. ${h.title ?? 'untitled'} | ${h.points ?? 0} points | ${h.num_comments ?? 0} comments | ${h.author ?? ''} | ${(h.created_at ?? '').slice(0, 10)}${h.url ? `\n   ${h.url}` : ''}`)
    .join('\n');
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) throw new HnError('Provide a search query.');
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const d = await get<{ hits?: HnHit[]; nbHits?: number }>(`${ALGOLIA_BASE}/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=${limit}`);
  const hits = d.hits ?? [];
  if (!hits.length) return `No Hacker News stories found for "${q}".`;
  return `Hacker News results for "${q}" (${d.nbHits ?? hits.length} total, ${hits.length} shown):\n` + formatHits(hits);
}

export async function frontPage(args: { limit?: number }): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const d = await get<{ hits?: HnHit[] }>(`${ALGOLIA_BASE}/search?tags=front_page&hitsPerPage=${limit}`);
  const hits = d.hits ?? [];
  if (!hits.length) return 'No front page stories right now.';
  return `Hacker News front page (${hits.length} shown):\n` + formatHits(hits);
}
