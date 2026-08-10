const BASE = 'https://api.wordpress.org/themes/info/1.1/';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const body = new URLSearchParams({
    action: 'query_themes',
    'request[search]': q,
    'request[per_page]': String(limit),
  });
  const res = await fetch(`${BASE}?${body}`, {
    headers: { 'User-Agent': 'mrfentmen-wordpress-themes-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`WordPress API returned ${res.status}`);
  const data = (await res.json()) as {
    info?: { results?: number };
    themes?: Array<Record<string, unknown>>;
  };
  const themes = data.themes ?? [];
  if (!themes.length) return `No WordPress themes found for "${q}".`;
  return `WordPress themes for "${q}" (${data.info?.results ?? themes.length} total, ${themes.length} shown):\n` +
    themes
      .map((t, i) => {
        const version = t.version ? ` v${t.version}` : '';
        const rating = typeof t.rating === 'number' ? ` | rating ${t.rating.toFixed(1)}` : '';
        const downloads = t.downloaded ? ` | ${Number(t.downloaded).toLocaleString()} downloads` : '';
        return `${i + 1}. ${t.name ?? 'untitled'}${version}${rating}${downloads}`;
      })
      .join('\n');
}
