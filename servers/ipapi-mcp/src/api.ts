const UA = 'mrfentmen-ipapi-mcp/1.0';

export interface LookupArgs {
  ip?: string;
}

export async function lookup(args: LookupArgs): Promise<string> {
  const ip = (args?.ip ?? '').trim();
  const url = ip ? `https://ipapi.co/${encodeURIComponent(ip)}/json/` : 'https://ipapi.co/json/';
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`ipapi.co returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  if (d.error) throw new Error(`ipapi.co error: ${String(d.reason ?? d.message ?? 'unknown')}`);
  const get = (k: string) => String(d[k] ?? '?');
  return [
    `ipapi.co geolocation${ip ? ` for ${ip}` : ''}:`,
    `IP: ${get('ip')} | Country: ${get('country_name')} (${get('country_code')})`,
    `Region: ${get('region')} | City: ${get('city')}`,
    `Latitude: ${get('latitude')} | Longitude: ${get('longitude')}`,
    `ISP: ${get('org')} | Timezone: ${get('timezone')}`,
  ].filter(Boolean).join('\n');
}
