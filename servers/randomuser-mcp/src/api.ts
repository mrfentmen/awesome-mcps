const BASE = 'https://randomuser.me/api/';

export interface UsersArgs {
  count?: number;
}

export async function users(args: UsersArgs = {}): Promise<string> {
  const count = Math.max(1, Math.min(args.count ?? 5, 20));
  const res = await fetch(`${BASE}?results=${count}`, {
    headers: { 'User-Agent': 'mrfentmen-randomuser-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Random User returned ${res.status}`);
  const data = (await res.json()) as {
    results?: Array<{
      name?: { first?: string; last?: string };
      email?: string;
      location?: { city?: string; country?: string };
      picture?: { large?: string };
    }>;
  };
  const results = data.results ?? [];
  if (!results.length) return 'No users returned.';
  return `Random users (${results.length}):\n` +
    results
      .map((u, i) => `${i + 1}. ${u.name?.first ?? ''} ${u.name?.last ?? ''} | ${u.email ?? ''} | ${u.location?.city ?? ''}, ${u.location?.country ?? ''}${u.picture?.large ? `\n   ${u.picture.large}` : ''}`)
      .join('\n');
}
