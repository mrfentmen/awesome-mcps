const BASE = 'https://cataas.com/cat';

export async function random(_args: Record<string, never> = {}): Promise<string> {
  const res = await fetch(`${BASE}?json=true`, {
    headers: { 'User-Agent': 'mrfentmen-cataas-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Cataas returned ${res.status}`);
  const data = (await res.json()) as { url?: string; tags?: string[] };
  if (!data.url) throw new Error('Cataas returned an empty response');
  const tags = (data.tags ?? []).slice(0, 5).join(', ');
  return `Random cat photo${tags ? ` (tags: ${tags})` : ''}: ${data.url.startsWith('http') ? data.url : `https://cataas.com${data.url}`}`;
}
