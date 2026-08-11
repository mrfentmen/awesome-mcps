const UA = 'mrfentmen-dnstwister-mcp/1.0';
const BASE = 'https://dnstwister.report/api';

function hexEncode(s: string): string {
  let out = '';
  for (const c of s) out += c.charCodeAt(0).toString(16).padStart(2, '0');
  return out;
}

export interface DomainArg {
  domain: string;
}

export async function fuzz(args: DomainArg): Promise<string> {
  const domain = String(args.domain).trim().toLowerCase();
  if (!domain) throw new Error('Provide a domain.');
  const res = await fetch(`${BASE}/fuzz/${hexEncode(domain)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`DNS Twister returned ${res.status}`);
  const d = (await res.json()) as { fuzzy_domains?: Array<{ domain?: string; has_mx_url?: string; parked_score_url?: string; resolve_ip_url?: string }> };
  const fuzzies = d.fuzzy_domains ?? [];
  if (!fuzzies.length) return `No fuzzy domains for ${domain}.`;
  const flagged = fuzzies.filter((f) => f.has_mx_url || f.resolve_ip_url);
  return `Lookalike domains for ${domain} (${fuzzies.length} total, ${flagged.length} with DNS records):\n` +
    fuzzies.slice(0, 20).map((f) => `* ${f.domain ?? '?'} ${f.has_mx_url || f.resolve_ip_url ? '- has DNS records' : '- no DNS'}`).join('\n');
}

export async function whois(args: DomainArg): Promise<string> {
  const domain = String(args.domain).trim().toLowerCase();
  if (!domain) throw new Error('Provide a domain.');
  const res = await fetch(`${BASE}/whois/${hexEncode(domain)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`DNS Twister returned ${res.status}`);
  const d = (await res.json()) as { domain?: string; response?: string; retrieved?: string };
  if (d.domain == null) throw new Error('No whois returned.');
  return `Whois for ${d.domain ?? domain} (retrieved ${d.retrieved ?? '?'}):\n${(d.response ?? 'No whois data').slice(0, 800)}`;
}
