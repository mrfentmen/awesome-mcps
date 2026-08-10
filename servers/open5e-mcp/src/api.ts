const BASE = 'https://api.open5e.com/v1';

export interface MonstersArgs {
  search?: string;
  limit?: number;
}

export interface SpellsArgs {
  search?: string;
  limit?: number;
}

async function query(path: string): Promise<{ results?: unknown[] }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'User-Agent': 'mrfentmen-open5e-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Open5e returned ${res.status}`);
  return (await res.json()) as { results?: unknown[] };
}

export async function monsters(args: MonstersArgs = {}): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const search = (args.search ?? '').trim();
  const data = await query(`/monsters/?limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
  const rows = (data.results ?? []).map((m) => {
    const o = m as Record<string, unknown>;
    return `${o.name ?? 'unnamed'} | CR ${o.cr ?? 'n/a'} | type ${o.type ?? ''} | ${String(o.size ?? '').toLowerCase()} | hp ${o.hit_points ?? ''}`;
  });
  if (!rows.length) return `No monsters found${search ? ` for "${search}"` : ''}.`;
  return `Monsters (${rows.length} shown):\n` + rows.map((r, i) => `${i + 1}. ${r}`).join('\n');
}

export async function spells(args: SpellsArgs = {}): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const search = (args.search ?? '').trim();
  const data = await query(`/spells/?limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
  const rows = (data.results ?? []).map((s) => {
    const o = s as Record<string, unknown>;
    return `${o.name ?? 'unnamed'} | level ${o.level ?? 'n/a'} | school ${o.school ?? ''}`;
  });
  if (!rows.length) return `No spells found${search ? ` for "${search}"` : ''}.`;
  return `Spells (${rows.length} shown):\n` + rows.map((r, i) => `${i + 1}. ${r}`).join('\n');
}
