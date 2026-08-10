const BASE = 'https://anapioficeandfire.com/api';

export interface IdArgs {
  id: number;
}

export interface ListArgs {
  limit?: number;
}

export async function book(args: IdArgs): Promise<string> {
  const id = Math.floor(args.id ?? 0);
  if (!id) return 'Provide a book id.';
  const res = await fetch(`${BASE}/books/${id}`, {
    headers: { 'User-Agent': 'mrfentmen-got-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Ice and Fire returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  return [
    `${s('name')} (${s('released').slice(0, 10)})`,
    `Pages: ${s('numberOfPages')} | Publisher: ${s('publisher')}`,
    s('authors') ? `Authors: ${(d.authors as Array<unknown>).join(', ')}` : '',
    s('isbn') ? `ISBN: ${s('isbn')}` : '',
  ].filter(Boolean).join('\n');
}

export async function character(args: IdArgs): Promise<string> {
  const id = Math.floor(args.id ?? 0);
  if (!id) return 'Provide a character id.';
  const res = await fetch(`${BASE}/characters/${id}`, {
    headers: { 'User-Agent': 'mrfentmen-got-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Ice and Fire returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  const names = (d.aliases ?? []) as Array<unknown>;
  return [
    `${s('name')}${s('gender') ? ` (${s('gender')})` : ''}`,
    s('culture') ? `Culture: ${s('culture')}` : '',
    s('born') ? `Born: ${s('born')}` : '',
    s('died') ? `Died: ${s('died')}` : '',
    names.length ? `Aliases: ${names.slice(0, 4).join(', ')}` : '',
  ].filter(Boolean).join('\n');
}

export async function houses(args: ListArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/houses?pageSize=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-got-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Ice and Fire returned ${res.status}`);
  const d = (await res.json()) as Array<Record<string, unknown>>;
  if (!d.length) return 'No houses returned.';
  return `Houses (${d.length} shown):\n` +
    d.map((h, i) => {
      const s = (k: string) => (h[k] != null ? String(h[k]) : '');
      return `${i + 1}. ${s('name')} | ${s('region')} | words: ${s('words') || 'none'}`;
    }).join('\n');
}
