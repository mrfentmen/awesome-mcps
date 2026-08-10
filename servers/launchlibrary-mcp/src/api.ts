const BASE = 'https://ll.thespacedevs.com/2.2.0/launch';

export interface ListArgs {
  limit?: number;
}

export async function upcoming(args: ListArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/upcoming/?limit=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-launchlibrary-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Space Devs returned ${res.status}`);
  const d = (await res.json()) as { results?: Array<Record<string, unknown>> };
  const rows = d.results ?? [];
  if (!rows.length) return 'No upcoming launches.';
  return `Upcoming launches (${rows.length} shown):\n` +
    rows.map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      const m = r.mission as Record<string, unknown> | undefined; const name = String(r.name ?? m?.name ?? "");
      const pad = (r.pad ?? {}) as Record<string, unknown>;
      const loc = (pad.location ?? {}) as Record<string, unknown>;
      return `${i + 1}. ${String(name ?? '')} | ${String(s('net').slice(0, 16))} | ${String(loc.name ?? pad.name ?? '')}`;
    }).join('\n');
}

export async function previous(args: ListArgs): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const res = await fetch(`${BASE}/previous/?limit=${limit}`, {
    headers: { 'User-Agent': 'mrfentmen-launchlibrary-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Space Devs returned ${res.status}`);
  const d = (await res.json()) as { results?: Array<Record<string, unknown>> };
  const rows = d.results ?? [];
  if (!rows.length) return 'No previous launches.';
  return `Previous launches (${rows.length} shown):\n` +
    rows.map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      const m = r.mission as Record<string, unknown> | undefined; const name = String(r.name ?? m?.name ?? "");
      const status = (r.status ?? {}) as Record<string, unknown>;
      return `${i + 1}. ${String(name ?? '')} | ${String(s('net').slice(0, 16))} | ${String(status.name ?? '')}`;
    }).join('\n');
}
