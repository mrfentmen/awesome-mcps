const BASE = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access';

export interface TopArgs {
  date?: string;
  limit?: number;
}

export async function top(args: TopArgs = {}): Promise<string> {
  const date = (args.date ?? '').trim();
  // Wikimedia lags about a day, so the default is yesterday.
  const fallback = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const iso = date.length === 10 ? date : fallback;
  const day = `${iso.slice(0, 4)}/${iso.slice(5, 7)}/${iso.slice(8, 10)}`;
  const url = `${BASE}/${day}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-wikipedia-pageviews-mcp/1.0 (https://github.com/mrfentmen)', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Wikimedia returned ${res.status}`);
  const data = (await res.json()) as {
    items?: Array<{ articles?: Array<{ article?: string; views?: number }> }>;
  };
  const articles = data.items?.[0]?.articles ?? [];
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const shown = articles.slice(0, limit);
  if (!shown.length) return `No pageview data for ${day}.`;
  return `Top Wikipedia pages on ${day} (${shown.length} shown):\n` +
    shown.map((a, i) => `${i + 1}. ${a.article ?? 'unknown'} | ${Number(a.views ?? 0).toLocaleString()} views`).join('\n');
}
