const UA = 'mrfentmen-census-geo-mcp/1.0';
const BASE = 'https://geocoding.geo.census.gov/geocoder/locations';

export interface AddressArgs {
  address: string;
}
export interface CoordArgs {
  x: number;
  y: number;
}

export async function geocode(args: AddressArgs): Promise<string> {
  const addr = String(args.address).trim();
  if (!addr) throw new Error('Provide a street address.');
  const res = await fetch(`${BASE}/onelineaddress?address=${encodeURIComponent(addr)}&benchmark=Public_AR_Current&format=json`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Census geocoder returned ${res.status}`);
  const d = (await res.json()) as { result?: { addressMatches?: Array<{ matchedAddress?: string; coordinates?: { x?: number; y?: number }; tigerLine?: { tigerLineId?: string; side?: string }; geographies?: { 'Census Blocks'?: Array<{ GEOID?: string; STATE?: string; COUNTY?: string; TRACT?: string; BLOCK?: string }> } }> } };
  const matches = d.result?.addressMatches ?? [];
  if (!matches.length) return `No address match for "${args.address}".`;
  const m = matches[0];
  const block = m.geographies?.['Census Blocks']?.[0];
  return `Address match for "${args.address}":\nMatched: ${m.matchedAddress ?? '?'}\nCoordinates: ${m.coordinates?.y ?? '?'}, ${m.coordinates?.x ?? '?'}\nFIPS block: ${block?.GEOID ?? '?'} (state ${block?.STATE ?? '?'}, county ${block?.COUNTY ?? '?'}, tract ${block?.TRACT ?? '?'}, block ${block?.BLOCK ?? '?'})`;
}

export async function coordinates(args: CoordArgs): Promise<string> {
  const x = Number(args.x), y = Number(args.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Provide valid x (lon) and y (lat).');
  const res = await fetch(`${BASE}/coordinates?x=${x}&y=${y}&benchmark=Public_AR_Current&format=json`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Census geocoder returned ${res.status}`);
  const d = (await res.json()) as { result?: { geographies?: { 'Census Blocks'?: Array<{ GEOID?: string; STATE?: string; COUNTY?: string; TRACT?: string; BLOCK?: string }> } } };
  const block = d.result?.geographies?.['Census Blocks']?.[0];
  if (!block?.GEOID) throw new Error(`No census geography for ${x},${y}.`);
  return `Census geography for ${x},${y}:\nFIPS block: ${block.GEOID}\nState: ${block.STATE ?? '?'} | County: ${block.COUNTY ?? '?'} | Tract: ${block.TRACT ?? '?'} | Block: ${block.BLOCK ?? '?'}`;
}
