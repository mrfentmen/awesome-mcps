const BASE = 'https://api.db-ip.com/v2/free';
const UA = 'mrfentmen-db-ip-mcp/1.0';

export interface LookupArgs {
  ip: string;
}

export async function lookup(args: LookupArgs): Promise<string> {
  const ip = (args.ip ?? '').trim();
  if (!ip) return 'Provide an IP address.';
  const res = await fetch(`${BASE}/${encodeURIComponent(ip)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`DB-IP returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const get = (k: string) => String(d[k] ?? '?');
  return [
    `DB-IP for ${ip}:`,
    `Country: ${get('countryName')} (${get('countryCode')})`,
    `Continent: ${get('continentCode')}`,
    d.stateProv ? `State: ${get('stateProv')}` : null,
    d.city ? `City: ${get('city')}` : null,
    d.latitude != null ? `Latitude: ${get('latitude')} | Longitude: ${get('longitude')}` : null,
    d.timeZone ? `Timezone: ${get('timeZone')}` : null,
  ].filter(Boolean).join('\n');
}
