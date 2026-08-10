const BASE = 'https://api.svgl.app';
const UA = 'mrfentmen-svgl-mcp/1.0';

export interface LogosArgs {
  category?: string;
  limit?: number;
}

export async function logos(args: LogosArgs): Promise<string> {
  const limit = Math.min(Math.max(Number(args?.limit ?? 25) || 25, 1), 50);
  const q = (args?.category ?? '').trim();
  const url = q ? `${BASE}/category/${encodeURIComponent(q)}` : `${BASE}/`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`SVGL returned ${res.status}`);
  const d = (await res.json()) as Array<{ title?: string; category?: string; route?: string } | string>;
  if (!Array.isArray(d) || !d.length) return q ? `No logos in category "${q}".` : 'No logos returned.';
  const rows = d.slice(0, limit).map((x, i) => {
    if (typeof x === 'string') return `${i + 1}. ${x}`;
    return `${i + 1}. ${x.title ?? '?'} [${x.category ?? '?'}] ${x.route ?? ''}`.trim();
  });
  return `SVGL logos (${d.length} available, showing ${rows.length}):\n${rows.join('\n')}`;
}

export async function categories(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/categories`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`SVGL returned ${res.status}`);
  const d = (await res.json()) as string[];
  if (!Array.isArray(d) || !d.length) return 'No categories returned.';
  return `SVGL categories (${d.length}):\n${d.map((c, i) => `${i + 1}. ${c}`).join('\n')}`;
}
