const BASE = 'https://gutendex.com/books';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export interface BookArgs {
  id: number;
}

interface GBook {
  id?: number;
  title?: string;
  authors?: Array<{ name?: string }>;
  subjects?: string[];
  languages?: string[];
  download_count?: number;
  formats?: Record<string, string>;
}

function bookLine(b: GBook, i: number): string {
  const authors = (b.authors ?? []).map((a) => a.name ?? '').filter(Boolean).slice(0, 2).join(', ');
  return `${i + 1}. ${b.title ?? 'untitled'} | ${authors || 'unknown'} | ${(b.languages ?? []).join(', ')} | downloads ${b.download_count ?? 0}${b.id ? ` | id ${b.id}` : ''}`;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const res = await fetch(`${BASE}?search=${encodeURIComponent(q)}`, {
    headers: { 'User-Agent': 'mrfentmen-gutendex-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Gutendex returned ${res.status}`);
  const data = (await res.json()) as { count?: number; results?: GBook[] };
  const books = (data.results ?? []).slice(0, limit);
  if (!books.length) return `No Gutenberg books found for "${q}".`;
  return `Gutenberg results for "${q}" (${data.count ?? books.length} total, ${books.length} shown):\n` + books.map((b, i) => bookLine(b, i)).join('\n');
}

export async function book(args: BookArgs): Promise<string> {
  const id = Number(args.id);
  if (!Number.isInteger(id) || id <= 0) return 'Provide a positive Gutenberg book ID.';
  const res = await fetch(`${BASE}/${id}`, {
    headers: { 'User-Agent': 'mrfentmen-gutendex-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Gutendex returned ${res.status}`);
  const b = (await res.json()) as GBook;
  if (!b.id) return `No Gutenberg book found with id ${id}.`;
  const lines = [
    `Title: ${b.title ?? 'n/a'}`,
    `Authors: ${(b.authors ?? []).map((a) => a.name ?? '').filter(Boolean).join(', ') || 'n/a'}`,
    `Subjects: ${(b.subjects ?? []).slice(0, 5).join(', ') || 'n/a'}`,
    `Downloads: ${b.download_count ?? 0}`,
  ];
  const textUrl = b.formats?.['text/plain; charset=us-ascii'] ?? b.formats?.['text/html'];
  if (textUrl) lines.push(`Read: ${textUrl}`);
  return lines.join('\n');
}
