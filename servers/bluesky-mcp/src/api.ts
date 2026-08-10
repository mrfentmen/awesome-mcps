const BASE = 'https://public.api.bsky.app/xrpc/app.bsky.actor.searchActors';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const params = new URLSearchParams({ q, limit: String(limit) });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-bluesky-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Bluesky returned ${res.status}`);
  const d = (await res.json()) as { actors?: Array<Record<string, unknown>> };
  const rows = d.actors ?? [];
  if (!rows.length) return `No Bluesky actors found for "${q}".`;
  return `Bluesky actors for "${q}" (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('handle')}${s('displayName') ? ` | ${s('displayName')}` : ''}${s('description') ? ` | ${s('description').slice(0, 80)}` : ''}`;
      })
      .join('\n');
}
