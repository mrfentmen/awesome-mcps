const BASE = 'https://zenquotes.io/api';
const UA = 'mrfentmen-zenquotes-mcp/1.0 (https://github.com/mrfentmen)';
export class ZenquotesError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new ZenquotesError(`zenquotes.io returned ${res.status}`);
  return (await res.json()) as T;
}

function fmt(q: { q?: string; a?: string }): string {
  return `"${q.q ?? ''}" — ${q.a ?? 'Unknown'}`;
}

export async function random(_args: Record<string, never> = {}): Promise<string> {
  const d = await get<Array<{ q?: string; a?: string }>>(`${BASE}/random`);
  if (!d.length) throw new ZenquotesError('zenquotes.io returned nothing');
  return fmt(d[0]);
}

export async function today(_args: Record<string, never> = {}): Promise<string> {
  const d = await get<Array<{ q?: string; a?: string }>>(`${BASE}/today`);
  if (!d.length) throw new ZenquotesError('zenquotes.io returned nothing');
  return `Today's quote:\n${fmt(d[0])}`;
}

export async function quotes(args: { limit?: number }): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 5, 15));
  const d = await get<Array<{ q?: string; a?: string }>>(`${BASE}/quotes`);
  if (!d.length) throw new ZenquotesError('zenquotes.io returned nothing');
  return `Quotes (${d.length} available, ${limit} shown):\n` + d.slice(0, limit).map((q, i) => `${i + 1}. ${fmt(q)}`).join('\n');
}
