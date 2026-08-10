const BASE = 'https://www.thesportsdb.com/api/v1/json/3';

export interface TeamArgs {
  query: string;
}

export interface LeagueArgs {
  id: number;
  limit?: number;
}

export async function team(args: TeamArgs): Promise<string> {
  const query = (args.query ?? '').trim();
  if (!query) return 'Provide a team name.';
  const res = await fetch(`${BASE}/searchteams.php?t=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': 'mrfentmen-thesportsdb-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`TheSportsDB returned ${res.status}`);
  const d = (await res.json()) as { teams?: Array<Record<string, unknown>> };
  const teams = d.teams ?? [];
  if (!teams.length) return `No teams found for "${query}".`;
  return `Teams for "${query}" (${teams.length} shown):\n` +
    teams.slice(0, 5).map((t, i) => {
      const s = (k: string) => (t[k] != null ? String(t[k]) : '');
      return `${i + 1}. ${s('strTeam')} (${s('strSport')} - ${s('strLeague')}) | ${s('strTeamShort') ? s('strTeamShort') : 'n/a'}`;
    }).join('\n');
}

export async function league(args: LeagueArgs): Promise<string> {
  const id = Math.floor(args.id ?? 0);
  if (!id) return 'Provide a league id.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/eventsnextleague.php?id=${id}`, {
    headers: { 'User-Agent': 'mrfentmen-thesportsdb-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`TheSportsDB returned ${res.status}`);
  const d = (await res.json()) as { events?: Array<Record<string, unknown>> };
  const events = d.events ?? [];
  if (!events.length) return `No upcoming events for league ${id}.`;
  return `Upcoming events (${Math.min(events.length, limit)} shown):\n` +
    events.slice(0, limit).map((e, i) => {
      const s = (k: string) => (e[k] != null ? String(e[k]) : '');
      return `${i + 1}. ${s('strHomeTeam')} vs ${s('strAwayTeam')} | ${s('strEventDate')} ${s('strTime')}`;
    }).join('\n');
}
