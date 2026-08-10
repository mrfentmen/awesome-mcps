const BASE = 'https://riddles-api.vercel.app/random';

export interface RandomArgs {
  // No arguments needed.
}

export async function random(_args: RandomArgs): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-riddles-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Riddles API returned ${res.status}`);
  const d = (await res.json()) as { riddle?: string; answer?: string };
  if (!d.riddle) return 'No riddle returned.';
  return `Riddle: ${d.riddle}\nAnswer: ${d.answer ?? '(hidden)'}`;
}
