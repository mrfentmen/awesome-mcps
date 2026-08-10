const BASE = 'https://nominatim.openstreetmap.org';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export interface ReverseArgs {
  lat: number;
  lon: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a place name.';
  const limit = Math.max(1, Math.min(args.limit ?? 5, 20));
  const url = `${BASE}/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-nominatim-mcp/1.0 (https://github.com/mrfentmen)', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Nominatim returned ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  if (!rows.length) return `No places found for "${q}".`;
  return `Places matching "${q}" (${rows.length} shown):\n` +
    rows
      .map((r, i) => `${i + 1}. ${r.display_name ?? 'n/a'}\n   ${r.type ?? ''} | lat ${r.lat} lon ${r.lon}`)
      .join('\n');
}

export async function reverse(args: ReverseArgs): Promise<string> {
  if (typeof args.lat !== 'number' || typeof args.lon !== 'number') {
    return 'Provide numeric latitude and longitude.';
  }
  const url = `${BASE}/reverse?lat=${args.lat}&lon=${args.lon}&format=jsonv2`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-nominatim-mcp/1.0 (https://github.com/mrfentmen)', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Nominatim returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  if (!d.display_name) return `No address found for ${args.lat}, ${args.lon}.`;
  return `Address for ${args.lat}, ${args.lon}:\n${d.display_name}`;
}
