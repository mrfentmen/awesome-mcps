const BASE = 'https://sports.core.api.espn.com/v2';
const UA = 'mrfentmen-espn-core-mcp/1.0';

export interface TeamsArgs {
  sport?: string;
  league?: string;
  limit?: number;
}

export interface AthletesArgs {
  team: string;
  limit?: number;
}

export async function teams(args: TeamsArgs): Promise<string> {
  const sport = (args?.sport ?? 'football').trim().toLowerCase();
  const league = (args?.league ?? 'nfl').trim().toLowerCase();
  const limit = Math.min(Math.max(Number(args?.limit ?? 20) || 20, 1), 40);
  const res = await fetch(`${BASE}/sports/${sport}/leagues/${league}/teams?limit=${limit}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`ESPN returned ${res.status}`);
  const d = (await res.json()) as { count?: number; items?: Array<{ $ref?: string }> };
  const items = d.items ?? [];
  if (!items.length) return `No ${league.toUpperCase()} teams found.`;
  const rows: string[] = [];
  for (const item of items.slice(0, limit)) {
    const ref = item.$ref ?? '';
    const idMatch = ref.match(/\/(\d+)$/);
    rows.push(`${rows.length + 1}. Team id=${idMatch ? idMatch[1] : '?'} (ref: ${ref.slice(0, 90)})`);
  }
  return `ESPN ${league.toUpperCase()} teams (total ${d.count ?? items.length}, showing ${rows.length}):\n${rows.join('\n')}`;
}

export async function athletes(args: AthletesArgs): Promise<string> {
  const team = (args.team ?? '').trim();
  if (!team) return 'Provide a team ref id.';
  const limit = Math.min(Math.max(Number(args.limit ?? 15) || 15, 1), 30);
  const res = await fetch(`${BASE}/sports/football/leagues/nfl/teams/${encodeURIComponent(team)}/athletes?limit=${limit}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`ESPN returned ${res.status}`);
  const d = (await res.json()) as { count?: number; items?: Array<{ $ref?: string }> };
  const items = d.items ?? [];
  if (!items.length) return 'No athletes found.';
  const rows: string[] = [];
  for (const item of items.slice(0, limit)) {
    const ref = item.$ref ?? '';
    const idMatch = ref.match(/\/(\d+)$/);
    rows.push(`${rows.length + 1}. Athlete id=${idMatch ? idMatch[1] : '?'}`);
  }
  return `ESPN athletes (total ${d.count ?? items.length}, showing ${rows.length}):\n${rows.join('\n')}`;
}
