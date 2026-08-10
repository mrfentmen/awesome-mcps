const BASE = 'https://api.deps.dev/v3/systems';

export interface PackageArgs {
  system: string;
  name: string;
  version?: string;
}

export async function info(args: PackageArgs): Promise<string> {
  const system = (args.system ?? '').trim().toLowerCase();
  const name = (args.name ?? '').trim();
  if (!system || !name) return 'Provide an ecosystem (npm, pypi, maven, cargo) and a package name.';
  const version = (args.version ?? '').trim();
  const url = version
    ? `${BASE}/${encodeURIComponent(system)}/packages/${encodeURIComponent(name)}/versions/${encodeURIComponent(version)}`
    : `${BASE}/${encodeURIComponent(system)}/packages/${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-deps-dev-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`deps.dev returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  const str = (k: string) => {
    const v = d[k];
    if (Array.isArray(v)) return (v as unknown[]).slice(0, 10).map((x) => (x && typeof x === 'object' ? JSON.stringify(x).slice(0, 80) : String(x))).join(', ');
    return v != null ? String(v) : '';
  };
  return [
    `${s('name')}${s('version') ? ` ${s('version')}` : ''}`,
    s('description') ? `Desc: ${s('description').slice(0, 120)}` : '',
    s('licenses') ? `Licenses: ${s('licenses')}` : '',
    str('links') ? `Links: ${str('links')}` : '',
  ].filter(Boolean).join('\n') || `No data for ${name}.`;
}
