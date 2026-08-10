const BASE = 'https://codeberg.org/api/v1';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const params = new URLSearchParams({ q, limit: String(limit) });
  const res = await fetch(`${BASE}/repos/search?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-codeberg-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Codeberg returned ${res.status}`);
  const d = (await res.json()) as { data?: Array<Record<string, unknown>> };
  const rows = d.data ?? [];
  if (!rows.length) return `No Codeberg repos found for "${q}".`;
  return `Codeberg repos for "${q}" (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('full_name')}${s('description') ? ` | ${s('description').slice(0, 80)}` : ''}${s('stars_count') ? ` | stars ${s('stars_count')}` : ''}${s('html_url') ? `\n   ${s('html_url')}` : ''}`;
      })
      .join('\n');
}

export interface VersionArgs {
  // No arguments needed.
}

export async function version(_args: VersionArgs): Promise<string> {
  const res = await fetch(`${BASE}/version`, {
    headers: { 'User-Agent': 'mrfentmen-codeberg-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Codeberg returned ${res.status}`);
  const d = (await res.json()) as { version?: string };
  return `Codeberg server version: ${d.version ?? 'unknown'}`;
}
