const BASE = 'https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-email';

export interface EmailArgs {
  email: string;
}

export async function email(args: EmailArgs): Promise<string> {
  const email = (args.email ?? '').trim().toLowerCase();
  if (!email || !email.includes('@')) return 'Provide a valid email address.';
  const res = await fetch(`${BASE}?email=${encodeURIComponent(email)}`, {
    headers: { 'User-Agent': 'mrfentmen-hudsonrock-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Hudson Rock returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  const stole = (d.stolen_data ?? []) as Array<Record<string, unknown>>;
  if (!stole.length) return `No infostealer breach records for ${email}.`;
  const rows = stole.slice(0, 5).map((r, i) => {
    const f = (k: string) => (r[k] != null ? String(r[k]) : '');
    const creds = (r.credentials ?? []) as Array<Record<string, unknown>>;
    const credStr = creds.slice(0, 2).map((c) => `${String(c.name ?? '')}:${String(c.login ?? '')}`).join(' | ');
    return `${i + 1}. ${f('stealer_name')} | infected at ${f('computer_name')} on ${f('date_compromised')}${credStr ? ` | ${credStr}` : ''}`;
  });
  return [
    `Infostealer breaches for ${email}: ${stole.length} found`,
    ...rows,
  ].join('\n');
}
