const BASE = 'https://api.disneyapi.dev';

export interface QueryArgs {
  query: string;
}

export interface PageArgs {
  page?: number;
}

export async function character(args: QueryArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide a character name or id.';
  const isNum = /^\d+$/.test(query);
  const url = isNum ? `${BASE}/characters/${query}` : `${BASE}/character?name=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-disney-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Disney returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const arr = (d.data as unknown[] | undefined) ?? []; const data = (isNum ? arr[0] : arr[0]) as Record<string, unknown> | undefined;
  if (!data) return `No character found for "${query}".`;
  const s = (k: string) => (data[k] != null ? String(data[k]) : '');
  const films = (data.films ?? []) as Array<unknown>;
  const tv = (data.tvShows ?? []) as Array<unknown>;
  const park = (data.parkAttractions ?? []) as Array<unknown>;
  return [
    `${s('name')} (id ${s('_id')})`,
    films.length ? `Films: ${films.slice(0, 5).join(', ')}` : '',
    tv.length ? `TV: ${tv.slice(0, 5).join(', ')}` : '',
    park.length ? `Park attractions: ${park.slice(0, 3).join(', ')}` : '',
    s('url') ? `\n${s('url')}` : '',
  ].filter(Boolean).join('\n');
}

export async function characters(args: PageArgs): Promise<string> {
  const page = Math.max(1, Math.floor(args.page ?? 1));
  const res = await fetch(`${BASE}/character?page=${page}&pageSize=20`, {
    headers: { 'User-Agent': 'mrfentmen-disney-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Disney returned ${res.status}`);
  const d = (await res.json()) as { data?: Array<Record<string, unknown>> };
  const rows = d.data ?? [];
  if (!rows.length) return `No characters on page ${page}.`;
  return `Disney characters (page ${page}):\n` +
    rows.map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      return `${i + 1}. ${s('name')}`;
    }).join('\n');
}
