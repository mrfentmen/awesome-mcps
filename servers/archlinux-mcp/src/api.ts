const UA = 'mrfentmen-archlinux-mcp/1.0';
const BASE = 'https://archlinux.org/packages/search/json';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = String(args.query).trim();
  if (!q) throw new Error('Provide a package query.');
  const limit = Math.min(Math.max(Number(args?.limit ?? 10) || 10, 1), 25);
  const res = await fetch(`${BASE}/?q=${encodeURIComponent(q)}&limit=${limit}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Arch Linux returned ${res.status}`);
  const d = (await res.json()) as { results?: Array<{ pkgname?: string; pkgver?: string; repo?: string; arch?: string; pkgdesc?: string; num_votes?: number; popularity?: number }> };
  const results = d.results ?? [];
  if (!results.length) return `No Arch packages matching "${args.query}".`;
  return `Arch Linux packages matching "${args.query}" (${results.length}):\n` + results.slice(0, limit).map((p, i) => `${i + 1}. ${p.pkgname ?? '?'} ${p.pkgver ?? '?'} [${p.repo ?? '?'}/${p.arch ?? '?'}] votes ${p.num_votes ?? 0}\n   ${(p.pkgdesc ?? '').slice(0, 100)}`).join('\n');
}
