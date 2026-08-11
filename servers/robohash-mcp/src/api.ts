const BASE = 'https://robohash.org';
const UA = 'mrfentmen-robohash-mcp/1.0 (https://github.com/mrfentmen)';

function sanitize(text: string): string {
  return text.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 64) || 'robohash';
}

export async function avatar(args: { text?: string; size?: number; set?: number }): Promise<string> {
  const text = sanitize(args.text ?? '');
  const size = Math.max(32, Math.min(args.size ?? 300, 1024));
  const set = args.set;
  const sets: Record<number, string> = { 1: 'set1', 2: 'set2', 3: 'set3', 4: 'set4', 5: 'set5' };
  const url = `${BASE}/${encodeURIComponent(text)}.png?size=${size}x${size}${set && sets[set] ? `&set=${sets[set]}` : ''}&bgset=bg1`;
  // Lightweight HEAD probe to confirm the image is servable.
  try {
    const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return `Avatar URL (probe returned ${res.status}): ${url}`;
  } catch {
    // network hiccup: still return the constructed URL
  }
  return `Robot avatar for "${args.text ?? ''}": ${url}\nDownload or embed the PNG directly.`;
}
