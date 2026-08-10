const BASE = 'https://users.roblox.com/v1/users';

export interface UserArgs {
  id: number;
}

export async function user(args: UserArgs): Promise<string> {
  const id = Math.floor(args.id ?? 0);
  if (!id) return 'Provide a numeric user id.';
  const res = await fetch(`${BASE}/${id}`, {
    headers: { 'User-Agent': 'mrfentmen-roblox-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Roblox returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  return [
    `${s('displayName')} (${s('name')})`,
    s('description') ? `\n${s('description').slice(0, 150)}` : '',
    s('created') ? `Created: ${String(s('created')).slice(0, 10)}` : '',
    s('isBanned') === 'true' ? 'Status: banned' : 'Status: active',
  ].filter(Boolean).join('\n') || `No data for user ${id}.`;
}
