const BASE = 'https://bundlephobia.com/api/size';

export interface SizeArgs {
  name: string;
}

export async function size(args: SizeArgs): Promise<string> {
  const name = (args.name ?? '').trim();
  if (!name) return 'Provide a package name.';
  const res = await fetch(`${BASE}?package=${encodeURIComponent(name)}`, {
    headers: { 'User-Agent': 'mrfentmen-bundlephobia-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Bundlephobia returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  const fmt = (n: unknown) => {
    const v = Number(n);
    if (!v) return 'n/a';
    if (v >= 1024 * 1024) return `${(v / 1024 / 1024).toFixed(2)} MB`;
    return `${(v / 1024).toFixed(1)} KB`;
  };
  const assets = (d.assets ?? []) as Array<Record<string, unknown>>;
  const jsAssets = assets.filter((a) => String(a.type ?? '') === 'js');
  const main = jsAssets[0] ?? assets[0] ?? {};
  return [
    `${s('name')}@${s('version')}`,
    `Minified: ${fmt(main.size ?? d.size)} | Gzip: ${fmt(main.gzip ?? d.gzip)}`,
    `Dependencies: ${s('dependencyCount')} | Has side effects: ${s('hasJSModule') ? 'module' : s('hasJSNext') ? 'next' : 'no'}`,
  ].filter(Boolean).join('\n');
}
