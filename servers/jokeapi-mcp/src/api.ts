const BASE = 'https://v2.jokeapi.dev/joke';

export interface RandomArgs {
  category?: string;
}

export async function random(args: RandomArgs = {}): Promise<string> {
  const cat = (args.category ?? '').trim();
  const url = cat
    ? `${BASE}/${encodeURIComponent(cat)}?type=single`
    : `${BASE}/Any?type=single`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-jokeapi-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`JokeAPI returned ${res.status}`);
  const data = (await res.json()) as { joke?: string; error?: boolean; message?: string };
  if (data.error) throw new Error(data.message ?? 'JokeAPI error');
  if (!data.joke) throw new Error('JokeAPI returned an empty joke');
  return data.joke;
}
