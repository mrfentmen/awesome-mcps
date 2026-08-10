const BASE = 'https://lemmy.world/api/v3/community/list';

export interface CommunitiesArgs {
  limit?: number;
}

export async function communities(args: CommunitiesArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const params = new URLSearchParams({
    limit: String(limit),
    sort: 'TopAll',
    type_: 'All',
  });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-lemmy-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Lemmy returned ${res.status}`);
  const d = (await res.json()) as { communities?: Array<Record<string, unknown>> };
  const rows = d.communities ?? [];
  if (!rows.length) return 'No communities returned.';
  return `Top Lemmy communities on lemmy.world (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const c = (r.community && typeof r.community === 'object' ? r.community as Record<string, unknown> : {});
        const s = (k: string) => (c[k] != null ? String(c[k]) : '');
        const subs = r.counts && typeof r.counts === 'object' ? (r.counts as Record<string, unknown>).subscribers : undefined;
        return `${i + 1}. ${s('name')}${s('title') ? ` | ${s('title')}` : ''}${subs ? ` | subscribers ${subs}` : ''}`;
      })
      .join('\n');
}
