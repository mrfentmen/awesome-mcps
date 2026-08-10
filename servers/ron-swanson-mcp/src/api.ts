const BASE = 'https://ron-swanson-quotes.herokuapp.com/v2';

export async function random(_args: Record<string, never> = {}): Promise<string> {
  const res = await fetch(`${BASE}/quotes`, {
    headers: { 'User-Agent': 'mrfentmen-ron-swanson-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`ron-swanson quotes returned ${res.status}`);
  const data = (await res.json()) as string[];
  if (!Array.isArray(data) || data.length === 0 || !data[0]) {
    throw new Error('ron-swanson quotes returned an empty response');
  }
  return data[0];
}
