const BASE = 'https://api.fbi.gov/wanted/v1';
const UA = 'mrfentmen-fbi-wanted-mcp/1.0 (https://github.com/mrfentmen)';
export class FbiError extends Error {}

async function get<T>(url: string): Promise<T> {
  // The FBI Wanted API rate-limits per IP; retry 403/429 with a short backoff.
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json', Referer: 'https://www.fbi.gov/wanted/' }, signal: AbortSignal.timeout(25000) });
    if (res.ok) return (await res.json()) as T;
    if ((res.status === 403 || res.status === 429) && attempt < 2) {
      // Akamai issues a challenge cookie on the first hit; give it time to clear.
      await new Promise((r) => setTimeout(r, attempt === 0 ? 10000 : 15000));
      continue;
    }
    throw new FbiError(`FBI Wanted returned ${res.status}`);
  }
  throw new FbiError('FBI Wanted request failed');
}

interface WantedItem {
  title?: string;
  description?: string;
  subjects?: string[];
  status?: string;
  reward_text?: string;
  publication?: string;
  url?: string;
  images?: Array<{ original?: string }>;
}

export async function wantedList(args: { page?: number; pageSize?: number }): Promise<string> {
  const page = Math.max(1, Math.floor(args.page ?? 1));
  const pageSize = Math.max(1, Math.min(args.pageSize ?? 10, 50));
  const d = await get<{ total?: number; items?: WantedItem[] }>(`${BASE}/list?page=${page}&pageSize=${pageSize}`);
  const items = d.items ?? [];
  if (!items.length) return 'No wanted persons returned.';
  return `FBI Wanted (${d.total ?? '?'} total, page ${page}):\n` + items.map((it, i) =>
    `${(page - 1) * pageSize + i + 1}. ${it.title ?? '?'} [${it.status ?? 'unknown'}]\n   ${(it.description ?? '').slice(0, 120)}\n   ${it.url ?? ''}`
  ).join('\n');
}

export async function search(args: { title?: string; pageSize?: number }): Promise<string> {
  const title = (args.title ?? '').trim();
  if (!title) throw new FbiError('Provide a search term');
  const pageSize = Math.max(1, Math.min(args.pageSize ?? 10, 50));
  const d = await get<{ total?: number; items?: WantedItem[] }>(`${BASE}/list?title=${encodeURIComponent(title)}&pageSize=${pageSize}`);
  const items = d.items ?? [];
  if (!items.length) return `No wanted persons matching "${title}".`;
  return `FBI Wanted matching "${title}" (${d.total ?? items.length} total, ${items.length} shown):\n` + items.map((it, i) =>
    `${i + 1}. ${it.title ?? '?'} [${it.status ?? 'unknown'}]\n   ${(it.description ?? '').slice(0, 150)}${it.reward_text ? `\n   Reward: ${it.reward_text}` : ''}\n   ${it.url ?? ''}`
  ).join('\n');
}

export async function topRewards(_args: Record<string, never> = {}): Promise<string> {
  const d = await get<{ items?: WantedItem[] }>(`${BASE}/list?pageSize=50`);
  const items = (d.items ?? []).filter((it) => it.reward_text).slice(0, 10);
  if (!items.length) return 'No reward listings returned.';
  return `FBI Wanted with rewards:\n` + items.map((it, i) =>
    `${i + 1}. ${it.title ?? '?'}\n   ${it.reward_text}\n   ${it.url ?? ''}`
  ).join('\n');
}
