const UA = 'mrfentmen-esm-mcp/1.0';

export interface PackageArgs {
  name: string;
  version?: string;
}
export interface BrowseArgs {
  name: string;
  version?: string;
  path?: string;
}

export async function resolve(args: PackageArgs): Promise<string> {
  const name = String(args.name).trim();
  if (!name) throw new Error('Provide a package name.');
  const version = args.version ? `@${encodeURIComponent(args.version)}` : '';
  const url = `https://esm.sh/${encodeURIComponent(name)}${version}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/javascript' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`esm.sh returned ${res.status}`);
  const body = await res.text();
  const firstLine = body.split('\n')[0] ?? '';
  const m = firstLine.match(/esm\.sh - (.+?)\s*\*\//);
  return `esm.sh module for ${args.name}${version ? `@${version}` : ''}:\n${m ? `Version: ${m[1]}` : 'Version: resolved'}\nURL: ${url}\nSize: ${body.length} bytes\nExports: ${(body.match(/export \{([^}]*)\}/)?.[1] ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12).join(', ') || 'named exports (see URL)'}`;
}

export async function browse(args: BrowseArgs): Promise<string> {
  const name = String(args.name).trim();
  if (!name) throw new Error('Provide a package name.');
  const version = args.version ? `@${encodeURIComponent(args.version)}` : '';
  const path = args.path ? `/${args.path.replace(/^\//, '')}` : '';
  const url = `https://esm.sh/${encodeURIComponent(name)}${version}${path}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/javascript,text/plain' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`esm.sh returned ${res.status}`);
  const body = await res.text();
  return `esm.sh ${args.name}${version ? `@${version}` : ''}${path}:\nURL: ${url}\nSize: ${body.length} bytes\nFirst lines:\n${body.split('\n').slice(0, 8).join('\n')}`;
}
