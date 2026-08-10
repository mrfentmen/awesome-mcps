const BASE = 'https://community.chocolatey.org/api/v2';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const res = await fetch(`${BASE}/Search()?$filter=IsLatestVersion&$search=%27${encodeURIComponent(q)}%27&$top=${limit}&$format=json`, {
    headers: { 'User-Agent': 'mrfentmen-chocolatey-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Chocolatey returned ${res.status}`);
  const d = (await res.json()) as { d?: { results?: Array<Record<string, unknown>> } };
  const rows = d.d?.results ?? [];
  if (!rows.length) return `No Chocolatey packages found for "${q}".`;
  return `Chocolatey packages for "${q}" (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('Title')} ${s('Version')}${s('Description') ? ` | ${s('Description').replace(/<[^>]*>/g, '').slice(0, 80)}` : ''}`;
      })
      .join('\n');
}
