const BASE = 'https://photon.komoot.io/api';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide a place name.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/?q=${encodeURIComponent(query)}&limit=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-photon-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Photon returned ${res.status}`);
  const d = (await res.json()) as { features?: Array<Record<string, unknown>> };
  const feats = d.features ?? [];
  if (!feats.length) return `No results for "${query}".`;
  return `Places for "${query}" (${feats.length} shown):\n` +
    feats.map((f, i) => {
      const p = (f.properties ?? {}) as Record<string, unknown>;
      const g = (f.geometry ?? {}) as Record<string, unknown>;
      const coords = (g.coordinates ?? []) as Array<number>;
      const s = (k: string) => (p[k] != null ? String(p[k]) : '');
      const label = [s('name'), s('city'), s('state'), s('country')].filter(Boolean).join(', ');
      const c = coords.length >= 2 ? ` [${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}]` : '';
      return `${i + 1}. ${label || s('osm_value')}${c}`;
    }).join('\n');
}
