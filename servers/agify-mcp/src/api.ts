const BASE = 'https://api.agify.io';

export interface AgeArgs {
  name: string;
}

export async function age(args: AgeArgs): Promise<string> {
  const name = (args.name ?? '').trim();
  if (!name) return 'Provide a first name.';
  const res = await fetch(`${BASE}?name=${encodeURIComponent(name)}`, {
    headers: { 'User-Agent': 'mrfentmen-agify-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Agify returned ${res.status}`);
  const data = (await res.json()) as { name?: string; age?: number | null; count?: number };
  if (typeof data.age !== 'number') return `No age estimate available for "${name}".`;
  return `${name}: estimated age ${data.age} (from ${data.count ?? 0} name records)`;
}
