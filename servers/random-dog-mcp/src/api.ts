const BASE = 'https://random.dog';

export async function random(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/woof.json`, {
    headers: { 'User-Agent': 'mrfentmen-random-dog-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`random.dog returned ${res.status}`);
  const d = (await res.json()) as { url?: string; fileSizeBytes?: number; urlSuffix?: string };
  return [
    `Random dog:`,
    `URL: ${d.url ?? '?'}`,
    d.fileSizeBytes ? `Size: ${(d.fileSizeBytes / 1024).toFixed(0)} KB` : null,
    d.urlSuffix ? `Suffix: ${d.urlSuffix}` : null,
  ].filter(Boolean).join('\n');
}
