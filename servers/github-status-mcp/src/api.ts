const BASE = 'https://www.githubstatus.com/api/v2';
const UA = 'mrfentmen-github-status-mcp/1.0';

export async function status(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/status.json`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`GitHub Status returned ${res.status}`);
  const d = (await res.json()) as {
    page?: { name?: string; updated_at?: string };
    status?: { indicator?: string; description?: string };
    components?: Array<{ name?: string; status?: string }>;
  };
  const components = d.components ?? [];
  return [
    `GitHub Status (${d.page?.name ?? '?'}):`,
    `Overall: ${d.status?.indicator ?? '?'} - ${d.status?.description ?? '?'}`,
    `Updated: ${d.page?.updated_at ?? '?'}`,
    components.length ? `Components:\n${components.slice(0, 20).map((c, i) => `  ${i + 1}. ${c.name ?? '?'}: ${c.status ?? '?'}`).join('\n')}` : null,
  ].filter(Boolean).join('\n');
}

export interface IncidentsArgs {
  limit?: number;
}

export async function incidents(args: IncidentsArgs): Promise<string> {
  const limit = Math.min(Math.max(Number(args?.limit ?? 5) || 5, 1), 10);
  const res = await fetch(`${BASE}/incidents/unresolved.json`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`GitHub Status returned ${res.status}`);
  const d = (await res.json()) as { incidents?: Array<{ name?: string; status?: string; impact?: string; created_at?: string; updated_at?: string }> };
  const incidents = d.incidents ?? [];
  if (!incidents.length) return 'No unresolved GitHub incidents.';
  return `GitHub unresolved incidents (${incidents.length}):\n` +
    incidents.slice(0, limit).map((i, n) => `${n + 1}. ${i.name ?? '?'} [${i.status ?? '?'}] impact ${i.impact ?? '?'}`).join('\n');
}
