const UA = 'mrfentmen-fcc-mcp/1.0';

export interface PointArgs {
  lat: number;
  lon: number;
}

export async function find(args: PointArgs): Promise<string> {
  const lat = Number(args.lat), lon = Number(args.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Provide valid lat and lon.');
  const res = await fetch(`https://geo.fcc.gov/api/census/block/find?latitude=${lat}&longitude=${lon}&format=json`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`FCC returned ${res.status}`);
  const d = (await res.json()) as { Block?: { FIPS?: string; bbox?: number[] }; County?: { name?: string; FIPS?: string }; State?: { name?: string; code?: string; FIPS?: string }; status?: string };
  if (!d.Block?.FIPS) throw new Error(`No census block for ${lat},${lon}.`);
  const fips = d.Block.FIPS;
  return `Census block for ${lat},${lon}:\nFIPS: ${fips}\nState: ${d.State?.name ?? '?'} (${d.State?.code ?? '?'})\nCounty: ${d.County?.name ?? '?'}\nState FIPS: ${d.State?.FIPS ?? '?'} | County FIPS: ${d.County?.FIPS ?? '?'}\nTract: ${fips.slice(2, 11)} | Block: ${fips.slice(11)}`;
}
