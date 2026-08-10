const BASE = 'https://api.adviceslip.com/advice';

export async function random(_args: Record<string, never> = {}): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-advice-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Advice Slip returned ${res.status}`);
  const data = (await res.json()) as { slip?: { id?: number; advice?: string } };
  if (!data.slip?.advice) throw new Error('Advice Slip returned an empty response');
  return data.slip.advice;
}
