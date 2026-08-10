const BASE = 'https://randomfox.ca/floof/';

export interface RandomArgs {
  // No arguments needed.
}

export async function random(_args: RandomArgs): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-fox-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`RandomFox returned ${res.status}`);
  const d = (await res.json()) as { image?: string; link?: string };
  if (!d.image) return 'No fox photo returned.';
  return `Random fox:\n${d.image}`;
}
