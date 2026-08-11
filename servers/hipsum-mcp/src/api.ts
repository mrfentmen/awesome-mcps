const UA = 'mrfentmen-hipsum-mcp/1.0';

export interface GenerateArgs {
  sentences?: number;
}

export async function generate(args: GenerateArgs): Promise<string> {
  const sentences = Math.min(Math.max(Number(args?.sentences ?? 3) || 3, 1), 10);
  const res = await fetch(`https://hipsum.co/api/?type=hipster-latin&sentences=${sentences}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Hipsum returned ${res.status}`);
  const d = (await res.json()) as string[];
  if (!Array.isArray(d) || !d.length) return 'No hipster text returned.';
  return `Hipster ipsum (${sentences} sentences):\n${d.join(' ')}`;
}
