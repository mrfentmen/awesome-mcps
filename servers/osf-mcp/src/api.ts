const BASE = 'https://api.osf.io/v2/nodes';

export interface ListArgs {
  limit?: number;
}

export interface NodeArgs {
  id: string;
}

export async function nodes(args: ListArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/?page[size]=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-osf-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`OSF returned ${res.status}`);
  const d = (await res.json()) as { data?: Array<Record<string, unknown>> };
  const rows = d.data ?? [];
  if (!rows.length) return 'No OSF nodes returned.';
  return `Public OSF nodes (${rows.length} shown):\n` +
    rows.map((r, i) => {
      const a = (r.attributes ?? {}) as Record<string, unknown>;
      const s = (k: string) => (a[k] != null ? String(a[k]) : '');
      return `${i + 1}. ${s('title')} | ${s('date_created').slice(0, 10)} | ${s('category')}`;
    }).join('\n');
}

export async function node(args: NodeArgs): Promise<string> {
  const id = (args.id ?? '').trim();
  if (!id) return 'Provide a node id.';
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}/`, {
    headers: { 'User-Agent': 'mrfentmen-osf-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`OSF returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const dd = d.data as Record<string, unknown> | undefined;
  const a = ((dd?.attributes ?? {}) ?? {}) as Record<string, unknown>;
  const s = (k: string) => (a[k] != null ? String(a[k]) : '');
  const rel = ((dd?.relationships ?? {}) ?? {}) as Record<string, unknown>;
  return [
    s('title') || `Node ${id}`,
    s('description') ? `\n${s('description')}` : '',
    `Category: ${s('category')} | Created: ${s('date_created').slice(0, 10)}`,
    Object.keys(rel).length ? `Relationships: ${Object.keys(rel).slice(0, 8).join(', ')}` : '',
  ].filter(Boolean).join('\n');
}
