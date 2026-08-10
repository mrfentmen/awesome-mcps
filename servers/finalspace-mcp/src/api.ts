const BASE = 'https://finalspaceapi.com/api/v0';

export async function characters(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/character/`, {
    headers: { 'User-Agent': 'mrfentmen-finalspace-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Final Space returned ${res.status}`);
  const d = (await res.json()) as Array<Record<string, unknown>>;
  if (!d.length) return 'No characters returned.';
  return `Final Space characters (${d.length}):\n` +
    d.slice(0, 20).map((c, i) => {
      const s = (k: string) => (c[k] != null ? String(c[k]) : '');
      return `${i + 1}. ${s('name')} (${s('species')}) - ${s('status')}`;
    }).join('\n');
}

export async function character(args: { id: number }): Promise<string> {
  const id = Math.floor(args.id ?? 0);
  if (!id) return 'Provide a character id.';
  const res = await fetch(`${BASE}/character/${id}`, {
    headers: { 'User-Agent': 'mrfentmen-finalspace-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Final Space returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  const abilities = (d.abilities ?? []) as Array<unknown>;
  return [
    `${s('name')} (${s('species')})`,
    `Status: ${s('status')} | Gender: ${s('gender')}`,
    `Origin: ${s('origin')}`,
    abilities.length ? `Abilities: ${abilities.slice(0, 5).join(', ')}` : '',
  ].filter(Boolean).join('\n');
}
