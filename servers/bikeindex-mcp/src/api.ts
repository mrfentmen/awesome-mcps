const BASE = 'https://bikeindex.org/api/v3';
const UA = 'mrfentmen-bikeindex-mcp/1.0';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export interface BikeArgs {
  id: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide search terms.';
  const limit = Math.min(Math.max(Number(args.limit ?? 10) || 10, 1), 25);
  const res = await fetch(`${BASE}/search?per_page=${limit}&query=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Bike Index returned ${res.status}`);
  const d = (await res.json()) as { bikes?: Array<{ id?: number; title?: string; serial?: string; date_stolen?: number; status?: string }> };
  const bikes = d.bikes ?? [];
  if (!bikes.length) return `No bikes found for "${query}".`;
  const fmt = (ts?: number) => (ts ? new Date(ts * 1000).toISOString().slice(0, 10) : 'unknown');
  return `Bike Index results for "${query}":\n` +
    bikes.slice(0, limit).map((b, i) => `${i + 1}. ${b.title ?? 'Unnamed bike'} (id=${b.id ?? '?'}, stolen ${fmt(b.date_stolen)})`).join('\n');
}

export async function bike(args: BikeArgs): Promise<string> {
  const id = Number(args.id);
  if (!Number.isFinite(id) || id <= 0) return 'Provide a bike id.';
  const res = await fetch(`${BASE}/bikes/${id}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Bike Index returned ${res.status}`);
  const d = (await res.json()) as {
    bike?: {
      id?: number;
      title?: string;
      serial?: string;
      status?: string;
      date_stolen?: number;
      frame_colors?: string[];
      manufacturer_name?: string;
      frame_model?: string;
      year?: number;
      description?: string;
      thumb?: string;
    };
  };
  const b = d.bike ?? {};
  return [
    `Bike #${b.id ?? id}`,
    `Title: ${b.title ?? '?'}`,
    `Manufacturer: ${b.manufacturer_name ?? '?'} ${b.frame_model ?? ''} (${b.year ?? '?'})`.trim(),
    b.frame_colors?.length ? `Colors: ${b.frame_colors.join(', ')}` : null,
    `Status: ${b.status ?? '?'}`,
    b.date_stolen ? `Stolen: ${new Date(b.date_stolen * 1000).toISOString().slice(0, 10)}` : 'Not reported stolen',
    b.serial ? `Serial: ${b.serial}` : null,
    b.description ? `Description: ${b.description}` : null,
    b.thumb ? `Photo: ${b.thumb}` : null,
  ].filter(Boolean).join('\n');
}
