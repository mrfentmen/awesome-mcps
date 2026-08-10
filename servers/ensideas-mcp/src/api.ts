const BASE = 'https://api.ensideas.com/ens/resolve';

export interface ResolveArgs {
  name: string;
}

export async function resolve(args: ResolveArgs): Promise<string> {
  const name = (args.name ?? '').trim().toLowerCase();
  if (!name) return 'Provide an ENS name like vitalik.eth.';
  const res = await fetch(`${BASE}/${encodeURIComponent(name)}`, {
    headers: { 'User-Agent': 'mrfentmen-ensideas-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Ensideas returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  return [
    `${s('name')}`,
    s('address') ? `Address: ${s('address')}` : '',
    s('displayName') ? `Display name: ${s('displayName')}` : '',
    s('avatar') ? `Avatar: ${s('avatar').slice(0, 90)}` : '',
    s('description') ? `Desc: ${s('description').slice(0, 100)}` : '',
  ].filter(Boolean).join('\n') || `No ENS record found for ${name}.`;
}
