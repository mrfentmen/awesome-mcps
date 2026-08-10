const BASE = 'https://get.geojs.io/v1/ip/geo.json';
const UA = 'mrfentmen-geojs-mcp/1.0';

export interface LookupArgs {
  ip?: string;
}

export async function lookup(args: LookupArgs): Promise<string> {
  const ip = (args?.ip ?? '').trim();
  const url = ip ? `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json` : BASE;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`GeoJS returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const get = (k: string) => String(d[k] ?? '?');
  return [
    `GeoJS geolocation${ip ? ` for ${ip}` : ''}:`,
    `IP: ${get('ip')} | Country: ${get('country')} (${get('country_code')})`,
    `Region: ${get('region')} | City: ${get('city')}`,
    `Latitude: ${get('latitude')} | Longitude: ${get('longitude')}`,
    d.timezone ? `Timezone: ${get('timezone')}` : null,
    d.organization ? `Organization: ${get('organization')}` : null,
    d.area_code ? `Area code: ${get('area_code')}` : null,
  ].filter(Boolean).join('\n');
}

export async function self(_args?: unknown): Promise<string> {
  return lookup({});
}
