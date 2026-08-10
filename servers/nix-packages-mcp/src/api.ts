const BASE = 'https://channels.nixos.org/nixpkgs-unstable/packages.json';

export interface SearchArgs {
  query: string;
  limit?: number;
}

let cache: Array<Record<string, unknown>> | null = null;

async function getPackages(): Promise<Array<Record<string, unknown>>> {
  if (cache) return cache;
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-nix-packages-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`nixpkgs returned ${res.status}`);
  cache = (await res.json()) as Array<Record<string, unknown>>;
  return cache;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim().toLowerCase();
  if (!q) return 'Provide search terms.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const pkgs = await getPackages();
  const matches = pkgs
    .filter((p) => {
      const n = String(p.name ?? '').toLowerCase();
      const a = String(p.attr ?? '').toLowerCase();
      const d = String(p.description ?? '').toLowerCase();
      return n.includes(q) || a.includes(q) || d.includes(q);
    })
    .slice(0, limit);
  if (!matches.length) return `No nixpkgs packages found for "${q}".`;
  return `nixpkgs packages for "${q}" (${matches.length} shown):\n` +
    matches
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        return `${i + 1}. ${s('attr') || s('name')}${s('description') ? ` | ${s('description').slice(0, 80)}` : ''}`;
      })
      .join('\n');
}
