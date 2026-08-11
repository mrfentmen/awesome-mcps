const UA = 'mrfentmen-sefaria-mcp/1.0';

export interface TextArgs {
  ref: string;
}

export async function getText(args: TextArgs): Promise<string> {
  const ref = (args.ref ?? '').trim();
  if (!ref) return 'Provide a ref like Genesis.1.';
  const res = await fetch(`https://www.sefaria.org/api/texts/${encodeURIComponent(ref)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Sefaria returned ${res.status}`);
  const d = (await res.json()) as { ref?: string; heRef?: string; text?: Array<string | string[]>; type?: string; title?: string };
  const flatten = (t: Array<string | string[]>): string => t.map((x) => (Array.isArray(x) ? x.join(' ') : x)).join(' ');
  const body = Array.isArray(d.text) ? flatten(d.text).slice(0, 400) : 'n/a';
  return [
    `Sefaria ${d.ref ?? ref}${d.heRef ? ` (${d.heRef})` : ''}:`,
    body,
  ].filter(Boolean).join('\n');
}
