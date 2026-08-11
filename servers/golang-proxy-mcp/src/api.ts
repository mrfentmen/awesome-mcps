const UA = 'mrfentmen-golang-proxy-mcp/1.0';

export interface LatestArgs {
  module: string;
}

export async function latest(args: LatestArgs): Promise<string> {
  const mod = (args.module ?? '').trim();
  if (!mod) return 'Provide a module path like github.com/gorilla/mux.';
  const url = `https://proxy.golang.org/${mod.split('/').map(encodeURIComponent).join('/')}/@latest`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Go proxy returned ${res.status}`);
  const d = (await res.json()) as { Version?: string; Time?: string; Origin?: { VCS?: string; URL?: string } };
  if (!d.Version) throw new Error(`Go proxy: no version for ${mod}`);
  return [
    `Go module ${mod}:`,
    `Latest version: ${d.Version}`,
    `Published: ${d.Time ?? '?'}`,
    d.Origin?.VCS ? `Source: ${d.Origin.VCS} (${d.Origin.URL ?? '?'})` : null,
  ].filter(Boolean).join('\n');
}
