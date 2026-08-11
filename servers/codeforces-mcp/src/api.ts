const UA = 'mrfentmen-codeforces-mcp/1.0';
const BASE = 'https://codeforces.com/api';

export interface LimitArg {
  limit?: number;
}
export interface UserArg {
  handle: string;
}

export async function contests(args: LimitArg): Promise<string> {
  const limit = Math.min(Math.max(Number(args?.limit ?? 10) || 10, 1), 25);
  const res = await fetch(`${BASE}/contest.list?gym=false`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Codeforces returned ${res.status}`);
  const d = (await res.json()) as { status?: string; result?: Array<{ id?: number; name?: string; type?: string; phase?: string; startTimeSeconds?: number; durationSeconds?: number }> };
  if (d.status !== 'OK' || !d.result) throw new Error(`Codeforces error: ${d.status ?? 'unknown'}`);
  const upcoming = d.result.filter((c) => c.phase === 'BEFORE').slice(0, limit);
  const finished = d.result.filter((c) => c.phase === 'FINISHED').slice(0, limit);
  const fmt = (c: { name?: string; startTimeSeconds?: number; durationSeconds?: number }) => `* ${c.name ?? '?'} | starts ${new Date((c.startTimeSeconds ?? 0) * 1000).toISOString()} | ${Math.round((c.durationSeconds ?? 0) / 60)} min`;
  return `Codeforces contests:\nUpcoming (${upcoming.length}):\n${upcoming.map(fmt).join('\n') || 'none'}\nRecent finished (${finished.length}):\n${finished.map(fmt).join('\n') || 'none'}`;
}

export async function user(args: UserArg): Promise<string> {
  const res = await fetch(`${BASE}/user.info?handles=${encodeURIComponent(args.handle)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Codeforces returned ${res.status}`);
  const d = (await res.json()) as { status?: string; result?: Array<{ handle?: string; rating?: number; maxRating?: number; rank?: string; maxRank?: string; organization?: string; country?: string; contribution?: number; lastOnlineTimeSeconds?: number }> };
  const u = d.result?.[0];
  if (d.status !== 'OK' || !u) throw new Error(`User ${args.handle} not found.`);
  return `User ${u.handle ?? args.handle}\nRank: ${u.rank ?? 'unrated'} (max ${u.maxRank ?? 'unrated'} ${u.maxRating ?? 0})\nRating: ${u.rating ?? 'unrated'} (max ${u.maxRating ?? 0})\nCountry: ${u.country ?? '?'} | Org: ${u.organization ?? '?'}\nContribution: ${u.contribution ?? 0}\nLast seen: ${new Date((u.lastOnlineTimeSeconds ?? 0) * 1000).toISOString()}`;
}
