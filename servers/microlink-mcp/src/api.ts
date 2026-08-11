const UA = 'mrfentmen-microlink-mcp/1.0';

export interface PreviewArgs {
  url: string;
}

export async function preview(args: PreviewArgs): Promise<string> {
  const url = (args.url ?? '').trim();
  if (!/^https?:\/\//i.test(url)) return 'Provide a full URL like https://github.com.';
  const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Microlink returned ${res.status}`);
  const d = (await res.json()) as { status?: string; data?: { title?: string; description?: string; url?: string; lang?: string; image?: { url?: string } } };
  const data = d.data;
  if (d.status !== 'success' || !data) throw new Error('Microlink: could not preview that URL');
  return [
    `Microlink preview for ${url}:`,
    `Title: ${data.title ?? '?'}`,
    `Description: ${data.description ?? 'n/a'}`,
    `Language: ${data.lang ?? '?'}`,
    data.image?.url ? `Image: ${data.image.url}` : null,
  ].filter(Boolean).join('\n');
}
