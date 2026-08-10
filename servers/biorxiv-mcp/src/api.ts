const BASE = 'https://api.biorxiv.org/details/biorxiv';

export interface DetailsArgs {
  doi: string;
}

export interface RecentArgs {
  limit?: number;
}

export async function details(args: DetailsArgs): Promise<string> {
  const doi = (args.doi ?? '').trim();
  if (!doi) return 'Provide a bioRxiv DOI.';
  const res = await fetch(`${BASE}/${encodeURIComponent(doi)}`, {
    headers: { 'User-Agent': 'mrfentmen-biorxiv-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`bioRxiv returned ${res.status}`);
  const d = (await res.json()) as { collection?: Array<Record<string, unknown>> };
  const rows = d.collection ?? [];
  if (!rows.length) return `No bioRxiv record for ${doi}.`;
  const r = rows[0];
  const s = (k: string) => (r[k] != null ? String(r[k]) : '');
  return [
    s('title') || `bioRxiv ${doi}`,
    `Authors: ${s('authors').slice(0, 300)}`,
    `Posted: ${s('date')} | Version ${s('version')}`,
    `Category: ${s('category')}`,
  ].filter(Boolean).join('\n');
}

export async function recent(args: RecentArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/0/0/0/${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-biorxiv-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`bioRxiv returned ${res.status}`);
  const d = (await res.json()) as { collection?: Array<Record<string, unknown>> };
  const rows = d.collection ?? [];
  if (!rows.length) return 'No bioRxiv preprints returned.';
  return `Recent bioRxiv preprints (${rows.length} shown):\n` +
    rows.map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      return `${i + 1}. ${s('title')} | ${s('date')} | ${s('doi')}`;
    }).join('\n');
}
