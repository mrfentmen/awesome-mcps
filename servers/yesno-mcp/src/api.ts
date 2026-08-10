const BASE = 'https://yesno.wtf/api';

export async function answer(_args: Record<string, never> = {}): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-yesno-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`yesno.wtf returned ${res.status}`);
  const data = (await res.json()) as { answer?: string; image?: string };
  if (!data.answer) throw new Error('yesno.wtf returned an empty answer');
  return `${data.answer} ${data.image ?? ''}`.trim();
}
