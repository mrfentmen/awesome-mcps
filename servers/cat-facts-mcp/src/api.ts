const BASE = 'https://catfact.ninja/fact';

export async function fact(_args: Record<string, never> = {}): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-cat-facts-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Cat Facts returned ${res.status}`);
  const data = (await res.json()) as { fact?: string };
  if (!data.fact) throw new Error('Cat Facts returned an empty response');
  return data.fact;
}
