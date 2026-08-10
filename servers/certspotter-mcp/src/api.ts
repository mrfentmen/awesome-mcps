const BASE = 'https://api.certspotter.com/v1/issuances';

export interface IssuancesArgs {
  domain: string;
  limit?: number;
}

export async function issuances(args: IssuancesArgs): Promise<string> {
  const domain = (args.domain ?? '').trim().toLowerCase();
  if (!domain) return 'Provide a domain name.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const params = new URLSearchParams({ domain, include_subdomains: 'false', expand: 'dns_names', after: '0' });
  const res = await fetch(`${BASE}?${params.toString()}&count=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-certspotter-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Cert Spotter returned ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  if (!rows.length) return `No certificates found for ${domain}.`;
  return `Certificate issuances for ${domain} (${rows.slice(0, limit).length} shown):\n` +
    rows
      .slice(0, limit)
      .map((r, i) => {
        const s = (k: string) => (r[k] != null ? String(r[k]) : '');
        const names = Array.isArray(r.dns_names) ? (r.dns_names as string[]).slice(0, 4).join(', ') : '';
        return `${i + 1}. ${s('id')} | not before ${String(s('not_before')).slice(0, 10)} | ${names || s('common_name')}`;
      })
      .join('\n');
}
