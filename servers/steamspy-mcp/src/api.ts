const BASE = 'https://steamspy.com/api.php';

export interface AppArgs {
  appid: number;
}

export async function app(args: AppArgs): Promise<string> {
  const appid = Math.floor(args.appid ?? 0);
  if (!appid) return 'Provide a Steam app id.';
  const params = new URLSearchParams({ request: 'appdetails', appid: String(appid) });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-steamspy-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`SteamSpy returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  if (d.error) return `SteamSpy: ${s('error')}`;
  const genre = (d.genres && Array.isArray(d.genres) ? (d.genres as string[]).join(', ') : s('genre'));
  return [
    `${s('name')}`,
    genre ? `Genres: ${genre}` : '',
    s('owners') ? `Owners: ${s('owners')}` : '',
    s('price') ? `Price: $${Number(s('price')) / 100}` : '',
    s('positive') ? `Positive reviews: ${s('positive')}` : '',
    s('negative') ? `Negative reviews: ${s('negative')}` : '',
  ].filter(Boolean).join('\n') || `No data for app ${appid}.`;
}
