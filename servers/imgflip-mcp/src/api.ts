const BASE = 'https://api.imgflip.com/get_memes';

export interface TemplatesArgs {
  limit?: number;
}

export async function templates(args: TemplatesArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 20, 100));
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-imgflip-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Imgflip returned ${res.status}`);
  const d = (await res.json()) as { success?: boolean; data?: { memes?: Array<Record<string, unknown>> } };
  const rows = (d.data?.memes ?? []).slice(0, limit);
  if (!rows.length) return 'No meme templates returned.';
  return `Imgflip meme templates (${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('name')} (id ${s('id')})${s('box_count') ? ` | boxes ${s('box_count')}` : ''}`;
      })
      .join('\n');
}
