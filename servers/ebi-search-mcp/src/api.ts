const UA = 'mrfentmen-ebi-search-mcp/1.0';
const BASE = 'https://www.ebi.ac.uk/ebisearch/ws/rest';

export interface SearchArgs {
  query: string;
  domain?: string;
  size?: number;
}
export interface EntryArgs {
  domain: string;
  id: string;
}

export async function search(args: SearchArgs): Promise<string> {
  const size = Math.min(Math.max(Number(args?.size ?? 5) || 5, 1), 20);
  const domain = args.domain || 'ensembl';
  const url = `${BASE}/${encodeURIComponent(domain)}?query=${encodeURIComponent(args.query)}&size=${size}&format=json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`EBI Search returned ${res.status}`);
  const d = (await res.json()) as { hitCount?: number; entries?: Array<{ id?: string; source?: string; fields?: Array<{ name?: string; value?: string }> }> };
  const entries = d.entries ?? [];
  if (!entries.length) return `No EBI results in "${domain}" for "${args.query}".`;
  const lines = entries.slice(0, size).map((e, i) => {
    const name = e.fields?.find((f) => f.name === 'name' || f.name === 'title')?.value ?? '';
    return `${i + 1}. ${e.id ?? '?'} ${name ? `- ${name.slice(0, 80)}` : ''}`;
  });
  return `EBI Search "${args.query}" in ${domain} (${d.hitCount ?? entries.length} hits):\n` + lines.join('\n');
}

export async function entry(args: EntryArgs): Promise<string> {
  const url = `${BASE}/${encodeURIComponent(args.domain)}/entry/${encodeURIComponent(args.id)}?format=json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`EBI Search returned ${res.status}`);
  const d = (await res.json()) as { id?: string; source?: string; fields?: Array<{ name?: string; value?: string }> };
  if (!d.id) throw new Error('No entry returned.');
  const fields = (d.fields ?? []).slice(0, 15).map((f) => `* ${f.name ?? '?'}: ${(f.value ?? '').slice(0, 120)}`);
  return `Entry ${d.id} (${d.source ?? args.domain}):\n` + fields.join('\n');
}
