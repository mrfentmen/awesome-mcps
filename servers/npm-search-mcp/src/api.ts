const BASE = 'https://registry.npmjs.org';
const UA = 'mrfentmen-npm-search-mcp/1.0 (https://github.com/mrfentmen)';
export class NpmError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new NpmError(`npm registry returned ${res.status}`);
  return (await res.json()) as T;
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) throw new NpmError('Provide a search query');
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const d = await get<{ objects?: Array<{ package?: { name?: string; version?: string; description?: string; keywords?: string[] }; downloads?: { monthly?: number } }> }>(`${BASE}/-/v1/search?text=${encodeURIComponent(q)}&size=${limit}`);
  const objects = d.objects ?? [];
  if (!objects.length) return `No packages found for "${q}".`;
  return `npm packages matching "${q}" (${objects.length} shown):\n` + objects.map((o, i) => {
    const p = o.package ?? {};
    const dl = o.downloads?.monthly;
    return `${i + 1}. ${p.name ?? '?'}@${p.version ?? '?'}\n   ${p.description ?? ''}\n   ${dl != null ? `${(dl / 1e6).toFixed(1)}M downloads/mo` : ''}${p.keywords?.length ? ` | ${p.keywords.slice(0, 5).join(', ')}` : ''}`;
  }).join('\n');
}

export async function packageInfo(args: { name?: string }): Promise<string> {
  const name = (args.name ?? '').trim();
  if (!name) throw new NpmError('Provide a package name');
  const d = await get<{ name?: string; description?: string; version?: string; license?: string; homepage?: string; repository?: { url?: string }; dist?: { tarball?: string }; time?: Record<string, string>; maintainers?: Array<{ name?: string }> }>(`${BASE}/${encodeURIComponent(name)}`);
  const created = d.time ? Object.keys(d.time)[0] : undefined;
  return [
    `${d.name ?? name}@${d.version ?? '?'}`,
    d.description ?? '',
    `License: ${d.license ?? '?'}`,
    d.homepage ? `Homepage: ${d.homepage}` : null,
    d.repository?.url ? `Repo: ${d.repository.url}` : null,
    created ? `Published: ${created}` : null,
    d.maintainers?.length ? `Maintainers: ${d.maintainers.map((m) => m.name ?? '?').join(', ')}` : null,
  ].filter(Boolean).join('\n');
}
