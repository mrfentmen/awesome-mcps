const BASE = 'https://dummyjson.com/quotes/random';

export interface RandomArgs {
  // No arguments needed.
}

export async function random(_args: RandomArgs): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-quotes-rest-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Quote API returned ${res.status}`);
  const data = (await res.json()) as { quote?: string; author?: string };
  if (!data.quote) return 'No quote returned.';
  return `${data.quote}\n   -- ${data.author ?? 'Unknown'}`;
}
