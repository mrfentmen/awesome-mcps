const BASE = 'https://commons.wikimedia.org/w/api.php';

export interface RandomArgs {
  limit?: number;
}

export async function random(args: RandomArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 5, 15));
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'random',
    grnnamespace: '6',
    grnlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
  });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-wikimedia-feed-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Wikimedia Commons returned ${res.status}`);
  const data = (await res.json()) as { query?: { pages?: Record<string, unknown> } };
  const pages = data.query?.pages ?? {};
  const items = Object.values(pages).map((p) => {
    const rec = p as Record<string, unknown>;
    const info = Array.isArray(rec.imageinfo) ? (rec.imageinfo[0] as Record<string, unknown>) : {};
    const meta = (info.extmetadata as Record<string, unknown>) ?? {};
    const title = (meta.ImageDescription as Record<string, unknown>)?.value ?? rec.title ?? '';
    const artist = (meta.Artist as Record<string, unknown>)?.value ?? '';
    const clean = String(title).replace(/<[^>]*>/g, '').trim();
    const by = String(artist).replace(/<[^>]*>/g, '').trim();
    return `${clean}${by ? ` by ${by}` : ''}${info.descriptionurl ? `\n   ${info.descriptionurl}` : ''}`;
  });
  if (!items.length) return 'No random images returned.';
  return `Random Wikimedia Commons images (${items.length} shown):\n` + items.map((s, i) => `${i + 1}. ${s}`).join('\n');
}
