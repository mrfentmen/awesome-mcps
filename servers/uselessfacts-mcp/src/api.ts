const BASE = 'https://uselessfacts.jsph.pl/api/v2/facts';

export async function fact(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/random`, {
    headers: { 'User-Agent': 'mrfentmen-uselessfacts-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Useless Facts returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  return `Useless fact: ${String(d.text ?? 'no fact')}`;
}
