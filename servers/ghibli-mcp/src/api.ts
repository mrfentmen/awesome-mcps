const BASE = 'https://ghibliapi.vercel.app/films';

export interface FilmsArgs {
  // No arguments needed.
}

export interface FilmArgs {
  id: string;
}

export async function films(_args: FilmsArgs): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-ghibli-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Ghibli API returned ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  if (!rows.length) return 'No films returned.';
  return `Studio Ghibli films (${rows.length}):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('title')} (${s('release_date')}) | RT ${s('rt_score')}%`;
      })
      .join('\n');
}

export async function film(args: FilmArgs): Promise<string> {
  const id = (args.id ?? '').trim();
  if (!id) return 'Provide a film id.';
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    headers: { 'User-Agent': 'mrfentmen-ghibli-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Ghibli API returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  return [
    `${s('title')}${s('original_title') ? ` / ${s('original_title')}` : ''}`,
    s('release_date') ? `Released: ${s('release_date')}` : '',
    s('director') ? `Director: ${s('director')}` : '',
    s('producer') ? `Producer: ${s('producer')}` : '',
    s('rt_score') ? `Rotten Tomatoes: ${s('rt_score')}%` : '',
    s('running_time') ? `Runtime: ${s('running_time')} min` : '',
    s('description') ? `\n${s('description').slice(0, 200)}` : '',
  ].filter(Boolean).join('\n');
}
