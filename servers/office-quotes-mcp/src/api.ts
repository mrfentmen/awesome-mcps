const BASE = 'https://officeapi.akashrajpurohit.com';
const UA = 'mrfentmen-office-quotes-mcp/1.0 (https://github.com/mrfentmen)';
export class OfficeError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new OfficeError(`Office API returned ${res.status}`);
  return (await res.json()) as T;
}

export async function randomQuote(_args: Record<string, never> = {}): Promise<string> {
  const d = await get<{ id?: number; character?: string; quote?: string }>(`${BASE}/quote/random`);
  if (!d.quote) throw new OfficeError('Office API returned an empty quote');
  return `"${d.quote}" — ${d.character ?? '?'}`;
}

export async function quoteById(args: { id?: number }): Promise<string> {
  const id = Number(args.id);
  if (!Number.isFinite(id) || id <= 0) throw new OfficeError('Provide a quote id');
  const d = await get<{ id?: number; character?: string; quote?: string }>(`${BASE}/quote/${id}`);
  if (!d.quote) throw new OfficeError(`Quote ${id} not found`);
  return `"${d.quote}" — ${d.character ?? '?'}`;
}
