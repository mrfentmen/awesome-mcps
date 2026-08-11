const UA = 'mrfentmen-bigdatacloud-mcp/1.0';

export interface GeoArgs {
  lat: number;
  lon: number;
}

export async function clientIp(_args?: Record<string, never>): Promise<string> {
  const res = await fetch('https://api.bigdatacloud.net/data/client-ip', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`BigDataCloud returned ${res.status}`);
  const d = (await res.json()) as { ipString?: string; ipType?: string; isReachableGlobally?: boolean; isReachableByPrivateInternet?: boolean };
  if (!d.ipString) throw new Error('No IP returned.');
  return `Your IP: ${d.ipString} (${d.ipType ?? '?'})\nGlobally reachable: ${d.isReachableGlobally ?? '?'}`;
}

export async function reverseGeocode(args: GeoArgs): Promise<string> {
  const lat = Number(args.lat), lon = Number(args.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Provide valid lat and lon.');
  const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`BigDataCloud returned ${res.status}`);
  const d = (await res.json()) as { locality?: string; city?: string; principalSubdivision?: string; countryName?: string; countryCode?: string; postcode?: string; latitude?: number; longitude?: number };
  if (!d.countryName) throw new Error(`No location for ${lat},${lon}.`);
  return `Location for ${lat},${lon}:\n${[d.locality, d.city, d.principalSubdivision, d.countryName].filter(Boolean).join(', ')}\nCountry: ${d.countryName} (${d.countryCode ?? '?'})\nPostcode: ${d.postcode ?? '?'}\nConfirmed: ${d.latitude ?? '?'}, ${d.longitude ?? '?'}`;
}
