const BASE = 'https://api.swaggerhub.com';
const UA = 'mrfentmen-swaggerhub-mcp/1.0 (https://github.com/mrfentmen)';
export class SwaggerhubError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new SwaggerhubError(`SwaggerHub returned ${res.status}`);
  return (await res.json()) as T;
}

interface ApiEntry {
  name?: string;
  description?: string;
  properties?: Array<{ type?: string; url?: string }>;
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? '').trim();
  const limit = Math.max(1, Math.min(args.limit ?? 8, 20));
  const url = q ? `${BASE}/apis?query=${encodeURIComponent(q)}&limit=${limit}` : `${BASE}/apis?limit=${limit}`;
  const d = await get<{ totalCount?: number; apis?: ApiEntry[] }>(url);
  const apis = d.apis ?? [];
  if (!apis.length) return `No APIs found${q ? ` for "${q}"` : ''}.`;
  return `SwaggerHub APIs${q ? ` matching "${q}"` : ''} (${d.totalCount ?? apis.length} total, ${apis.length} shown):\n` +
    apis.map((a, i) => {
      const spec = a.properties?.find((p) => p.type === 'Swagger' || p.type === 'OpenAPI')?.url ?? '';
      return `${i + 1}. ${a.name ?? '?'}\n   ${a.description ?? ''}\n   ${spec}`;
    }).join('\n');
}

export async function byOwner(args: { owner?: string; limit?: number }): Promise<string> {
  const owner = (args.owner ?? '').trim();
  if (!owner) throw new SwaggerhubError('Provide an owner (user or org)');
  const limit = Math.max(1, Math.min(args.limit ?? 8, 20));
  const d = await get<{ apis?: ApiEntry[] }>(`${BASE}/apis/${encodeURIComponent(owner)}?limit=${limit}`);
  const apis = d.apis ?? [];
  if (!apis.length) return `No APIs found for owner "${owner}".`;
  return `APIs by ${owner} (${apis.length} shown):\n` + apis.map((a, i) => `${i + 1}. ${a.name ?? '?'}\n   ${a.description ?? ''}`).join('\n');
}
