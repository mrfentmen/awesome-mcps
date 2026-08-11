const UA = 'mrfentmen-devrant-mcp/1.0';

export interface RantsArgs {
  limit?: number;
}

export async function rants(args: RantsArgs): Promise<string> {
  const limit = Math.min(Math.max(Number(args?.limit ?? 5) || 5, 1), 20);
  const res = await fetch('https://devrant.com/api/devrant/rants?app=3&sort=algo&limit=10', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`devRant returned ${res.status}`);
  const d = (await res.json()) as { success?: boolean; rants?: Array<{ id?: number; text?: string; num_upvotes?: number; num_comments?: number; created_time?: number; user_username?: string }> };
  const list = d.rants ?? [];
  if (!list.length) return 'No rants returned.';
  return `devRant (${list.length}, showing ${Math.min(limit, list.length)}):\n` +
    list.slice(0, limit).map((r, i) => `${i + 1}. @${r.user_username ?? '?'} (${r.num_upvotes ?? 0} up, ${r.num_comments ?? 0} comments): ${(r.text ?? '').slice(0, 150)}`).join('\n');
}
