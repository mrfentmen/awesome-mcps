const BIBLE_API = 'https://bible-api.com';
const GETBIBLE_BASE = 'https://api.getbible.net/v2/kjv';
const UA = 'mrfentmen-bible-mcp/1.0 (https://github.com/mrfentmen)';
export class BibleError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
  if (res.status === 404) throw new BibleError('Reference not found');
  if (!res.ok) throw new BibleError(`Bible API error ${res.status}`);
  return (await res.json()) as T;
}

export async function verse(args: { reference?: string }): Promise<string> {
  const ref = (args.reference ?? '').trim();
  if (!ref) throw new BibleError('Provide a reference like John 3:16');
  const d = await get<any>(`${BIBLE_API}/${encodeURIComponent(ref)}`);
  const verses = (d.verses ?? []).map((v: any) => `${v.book_name ?? ''} ${v.chapter ?? ''}:${v.verse ?? ''} ${(v.text ?? '').trim()}`).join('\n\n');
  return `${d.reference ?? ref}\n${d.translation ?? ''}\n\n${verses}`;
}

// Whole-KJV text for search, fetched once per process and cached in memory.
let kjvCache: Array<{ nr: number; name: string; chapters: Array<{ chapter: number; verses: Array<{ verse: number; text: string }> }> }> | null = null;

async function kjvBooks() {
  if (kjvCache) return kjvCache;
  const res = await fetch('https://api.getbible.net/v2/kjv.json', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new BibleError(`GetBible returned ${res.status}`);
  const data = (await res.json()) as { books?: Array<{ nr: number; name: string; chapters: Array<{ chapter: number; verses: Array<{ verse: number; text: string }> }> }> };
  const books = data.books ?? [];
  if (!books.length) throw new BibleError('GetBible returned no books');
  kjvCache = books;
  return books;
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) throw new BibleError('Provide a search phrase');
  const limit = Math.min(args.limit ?? 8, 20);
  const needle = q.toLowerCase();
  const books = await kjvBooks();
  const matches: Array<{ ref: string; text: string }> = [];
  for (const book of books) {
    for (const ch of book.chapters) {
      for (const v of ch.verses) {
        const text = (v.text ?? '').trim();
        if (text.toLowerCase().includes(needle)) {
          matches.push({ ref: `${book.name} ${ch.chapter}:${v.verse}`, text: text.slice(0, 200) });
          if (matches.length >= limit) break;
        }
      }
      if (matches.length >= limit) break;
    }
    if (matches.length >= limit) break;
  }
  if (!matches.length) return `No KJV matches found for "${q}".`;
  return `KJV matches for "${q}" (${matches.length} shown):\n` +
    matches.map((m) => `${m.ref}\n  ${m.text}`).join('\n');
}

const BOOK_IDS: Record<string, number> = {
  genesis: 1, exodus: 2, leviticus: 3, numbers: 4, deuteronomy: 5, joshua: 6, judges: 7, ruth: 8,
  '1 samuel': 9, '2 samuel': 10, '1 kings': 11, '2 kings': 12, '1 chronicles': 13, '2 chronicles': 14,
  ezra: 15, nehemiah: 16, esther: 17, job: 18, psalms: 19, proverbs: 20, ecclesiastes: 21,
  'song of solomon': 22, isaiah: 23, jeremiah: 24, lamentations: 25, ezekiel: 26, daniel: 27,
  hosea: 28, joel: 29, amos: 30, obadiah: 31, jonah: 32, micah: 33, nahum: 34, habakkuk: 35,
  zephaniah: 36, haggai: 37, zechariah: 38, malachi: 39, matthew: 40, mark: 41, luke: 42, john: 43,
  acts: 44, romans: 45, '1 corinthians': 46, '2 corinthians': 47, galatians: 48, ephesians: 49,
  philippians: 50, colossians: 51, '1 thessalonians': 52, '2 thessalonians': 53, '1 timothy': 54,
  '2 timothy': 55, titus: 56, philemon: 57, hebrews: 58, james: 59, '1 peter': 60, '2 peter': 61,
  '1 john': 62, '2 john': 63, '3 john': 64, jude: 65, revelation: 66,
};

export async function kjvChapter(args: { book?: string; chapter?: number }): Promise<string> {
  const raw = (args.book ?? '').trim().toLowerCase();
  if (!raw) return 'Provide a book name like john or genesis.';
  const bookId = /^\d+$/.test(raw) ? Number(raw) : BOOK_IDS[raw];
  if (!bookId || bookId < 1 || bookId > 66) return 'Unknown book. Try a KJV book name like john or genesis.';
  const ch = Math.max(1, Math.min(Math.floor(args.chapter ?? 1), 150));
  const res = await fetch(`${GETBIBLE_BASE}/${bookId}/${ch}.json`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new BibleError(`GetBible returned ${res.status}`);
  const data = (await res.json()) as {
    book?: { name?: string };
    chapter?: number;
    verses?: Array<{ verse?: number; text?: string }>;
  };
  const verses = data.verses ?? [];
  if (!verses.length) return `No chapter ${ch} found for book ${bookId}.`;
  const name = data.book?.name ?? raw;
  return `${name} ${data.chapter ?? ch} (${verses.length} verses):\n` +
    verses.map((v) => `${v.verse}. ${(v.text ?? '').trim()}`).join('\n');
}
