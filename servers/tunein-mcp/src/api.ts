const BASE = 'https://opml.radiotime.com';
const UA = 'mrfentmen-tunein-mcp/1.0';

export async function browse(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/Browse.ashx?c=local`, {
    headers: { 'User-Agent': UA, Accept: 'application/xml' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`TuneIn returned ${res.status}`);
  const text = await res.text();
  if (!text.includes('<outline')) return 'No TuneIn categories returned.';
  const items = [...text.matchAll(/<outline\s+[^>]*text="([^"]*)"[^>]*\/>/g)]
    .map((m) => m[1])
    .filter(Boolean);
  return `TuneIn radio categories (${items.length}):\n${items.slice(0, 30).map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
}
