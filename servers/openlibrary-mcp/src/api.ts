const BASE = 'https://openlibrary.org';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export interface WorkArgs {
  key: string;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const url = `${BASE}/search.json?q=${encodeURIComponent(q)}&limit=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-openlibrary-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Open Library returned ${res.status}`);
  const data = (await res.json()) as {
    numFound?: number;
    docs?: Array<{ title?: string; author_name?: string[]; first_publish_year?: number; key?: string }>;
  };
  const docs = data.docs ?? [];
  if (!docs.length) return `No books found for "${q}".`;
  return `Open Library results for "${q}" (${data.numFound ?? docs.length} total, ${docs.length} shown):\n` +
    docs
      .map((d, i) => `${i + 1}. ${d.title ?? 'untitled'} | ${(d.author_name ?? []).slice(0, 2).join(', ') || 'unknown'} (${d.first_publish_year ?? ''}) | ${d.key ?? ''}`)
      .join('\n');
}

export async function work(args: WorkArgs): Promise<string> {
  const key = (args.key ?? '').trim();
  if (!key) return 'Provide a work key like OL123W.';
  const res = await fetch(`${BASE}${key}.json`, {
    headers: { 'User-Agent': 'mrfentmen-openlibrary-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Open Library returned ${res.status}`);
  const d = (await res.json()) as {
    title?: string;
    description?: string | { value?: string };
    subjects?: string[];
    first_publish_date?: string;
    covers?: number[];
  };
  const desc = typeof d.description === 'string' ? d.description : d.description?.value ?? '';
  const lines = [
    `Title: ${d.title ?? 'n/a'}`,
    `First published: ${d.first_publish_date ?? 'n/a'}`,
    `Subjects: ${(d.subjects ?? []).slice(0, 8).join(', ') || 'n/a'}`,
  ];
  if (desc) lines.push(`Description: ${desc.replace(/\s+/g, ' ').trim().slice(0, 400)}`);
  return lines.join('\n');
}
