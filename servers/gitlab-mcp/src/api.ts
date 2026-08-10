const BASE = 'https://gitlab.com/api/v4/projects';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const params = new URLSearchParams({ search: q, per_page: String(limit), simple: 'true' });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-gitlab-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`GitLab returned ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  if (!rows.length) return `No GitLab projects found for "${q}".`;
  return `GitLab projects for "${q}" (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('path_with_namespace')}${s('description') ? ` | ${s('description').slice(0, 80)}` : ''}${s('star_count') ? ` | stars ${s('star_count')}` : ''}${s('web_url') ? `\n   ${s('web_url')}` : ''}`;
      })
      .join('\n');
}
