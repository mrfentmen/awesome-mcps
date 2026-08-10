const BASE = 'https://api.rss2json.com/v1/api.json';

export interface FetchArgs {
  url: string;
  limit?: number;
}

export async function feed(args: FetchArgs): Promise<string> {
  const url = (args.url ?? '').trim();
  if (!url) return 'Provide an RSS feed URL.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const res = await fetch(`${BASE}?rss_url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': 'mrfentmen-rss2json-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`RSS2JSON returned ${res.status}`);
  const data = (await res.json()) as {
    status?: string;
    message?: string;
    feed?: { title?: string };
    items?: Array<{ title?: string; pubDate?: string; link?: string }>;
  };
  if (data.status !== 'ok') throw new Error(`RSS2JSON error: ${data.message ?? data.status ?? 'unknown'}`);
  const items = (data.items ?? []).slice(0, limit);
  if (!items.length) return 'The feed returned no items.';
  return `Feed: ${data.feed?.title ?? url} (${items.length} items):\n` +
    items
      .map((item, i) => `${i + 1}. ${item.title ?? 'untitled'} | ${(item.pubDate ?? '').slice(0, 16)}${item.link ? `\n   ${item.link}` : ''}`)
      .join('\n');
}
