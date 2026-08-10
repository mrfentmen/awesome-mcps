const BASE = 'https://api.nasa.gov/mars-photos/api/v1/rovers';

export interface PhotosArgs {
  rover?: string;
  sol?: number;
  limit?: number;
}

export async function photos(args: PhotosArgs = {}): Promise<string> {
  const rover = (args.rover ?? 'curiosity').trim().toLowerCase();
  const sol = args.sol ?? 1000;
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const url = `${BASE}/${encodeURIComponent(rover)}/photos?sol=${sol}&page=1&api_key=DEMO_KEY`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-nasa-mars-photos-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`NASA Mars Photos returned ${res.status}`);
  const data = (await res.json()) as { photos?: Array<Record<string, unknown>> };
  const rows = (data.photos ?? []).slice(0, limit);
  if (!rows.length) return `No ${rover} photos for sol ${sol}.`;
  return `${rover} rover photos, sol ${sol} (${rows.length} shown):\n` +
    rows
      .map((p, i) => {
        const camera = (p.camera ?? {}) as Record<string, unknown>;
        return `${i + 1}. ${p.id ?? 'unknown'} | ${camera.full_name ?? camera.name ?? ''} | ${p.img_src ?? ''}`;
      })
      .join('\n');
}
