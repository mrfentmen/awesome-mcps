const BASE = 'https://freegeoip.app/json';
const UA = 'mrfentmen-freegeoip-mcp/1.0';

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
  if (!res.ok) throw new Error(`FreeGeoIP returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const get = (k: string) => String(d[k] ?? '?');
  return [
    `FreeGeoIP for ${ip}:`,
    `Country: ${get('country_name')} (${get('country_code')})`,
    `Region: ${get('region_name')} | City: ${get('city')}`,
    `Latitude: ${get('latitude')} | Longitude: ${get('longitude')}`,
    d.zip_code ? `ZIP: ${get('zip_code')}` : null,
    d.time_zone ? `Timezone: ${get('time_zone')}` : null,
  ].filter(Boolean).join('\n');
}
