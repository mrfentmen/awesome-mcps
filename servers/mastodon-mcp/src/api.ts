const DEFAULT = 'https://mastodon.social';

export interface InstanceArgs {
  domain?: string;
}

export interface TrendsArgs {
  domain?: string;
  limit?: number;
}

export async function instance(args: InstanceArgs): Promise<string> {
  const base = (args.domain ?? '').trim().replace(/\/$/, '') || DEFAULT;
  const res = await fetch(`${base}/api/v1/instance`, {
    headers: { 'User-Agent': 'mrfentmen-mastodon-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Mastodon returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  const stats = (d.stats && typeof d.stats === 'object' ? d.stats as Record<string, unknown> : {});
  const ss = (k: string) => (stats[k] != null ? String(stats[k]) : '');
  return [
    `${s('title')} (${s('uri') ?? base.replace('https://', '')})`,
    s('description') ? `Desc: ${s('description').slice(0, 150)}` : '',
    ss('user_count') ? `Users: ${ss('user_count')}` : '',
    ss('status_count') ? `Posts: ${ss('status_count')}` : '',
    s('version') ? `Version: ${s('version')}` : '',
  ].filter(Boolean).join('\n') || `No data for ${base}.`;
}

export async function trends(args: TrendsArgs): Promise<string> {
  const base = (args.domain ?? '').trim().replace(/\/$/, '') || DEFAULT;
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const res = await fetch(`${base}/api/v1/trends?limit=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-mastodon-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Mastodon returned ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  if (!rows.length) return `No trends on ${base}.`;
  return `Trending tags on ${base} (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('name')}${s('history') && (r.history as unknown[])?.[0] ? ` | ${(r.history as Array<Record<string, unknown>>)[0].uses ?? ''} posts` : ''}`;
      })
      .join('\n');
}
