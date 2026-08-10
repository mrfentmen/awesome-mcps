const BASE = 'https://dog.ceo/api';

export interface RandomArgs {
  breed?: string;
}

export async function breeds(_args: Record<string, never> = {}): Promise<string> {
  const res = await fetch(`${BASE}/breeds/list/all`, {
    headers: { 'User-Agent': 'mrfentmen-dog-ceo-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Dog CEO returned ${res.status}`);
  const data = (await res.json()) as { message?: Record<string, string[]>; status?: string };
  const message = data.message ?? {};
  const rows = Object.entries(message).map(([breed, subs]) =>
    subs.length ? `${breed} (${subs.join(', ')})` : breed,
  );
  return `Dog breeds (${rows.length}):\n` + rows.map((r, i) => `${i + 1}. ${r}`).join('\n');
}

export async function random(args: RandomArgs = {}): Promise<string> {
  const breed = (args.breed ?? '').trim().toLowerCase();
  const url = breed ? `${BASE}/breed/${encodeURIComponent(breed)}/images/random` : `${BASE}/breeds/image/random`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-dog-ceo-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Dog CEO returned ${res.status}`);
  const data = (await res.json()) as { message?: string; status?: string };
  if (!data.message) return `No photo found${breed ? ` for breed "${breed}"` : ''}.`;
  return `Random dog photo${breed ? ` (${breed})` : ''}: ${data.message}`;
}
