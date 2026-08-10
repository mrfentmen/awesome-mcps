const BASE = 'https://geolocation-db.com/json/';

export interface LocateArgs {
  ip?: string;
}

export async function locate(args: LocateArgs = {}): Promise<string> {
  const ip = (args.ip ?? '').trim();
  const url = ip ? `${BASE}${encodeURIComponent(ip)}` : BASE;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-geolocation-db-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Geolocation DB returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  return [
    `IP: ${d.IPv4 ?? 'n/a'}`,
    `Country: ${d.country_name ?? 'n/a'} (${d.country_code ?? ''})`,
    `State: ${d.state ?? 'n/a'}`,
    `City: ${d.city ?? 'n/a'}`,
    `Postal: ${d.postal ?? 'n/a'}`,
    `Latitude: ${d.latitude ?? 'n/a'}`,
    `Longitude: ${d.longitude ?? 'n/a'}`,
  ].join('\n');
}
