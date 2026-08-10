const BASE = 'https://rest.ensembl.org';

export interface LookupArgs {
  species?: string;
  symbol: string;
}

export interface SeqArgs {
  id: string;
}

export async function lookup(args: LookupArgs): Promise<string> {
  const symbol = (args.symbol ?? '').trim();
  const species = (args.species ?? 'human').trim();
  if (!symbol) return 'Provide a gene symbol.';
  const res = await fetch(`${BASE}/lookup/symbol/${encodeURIComponent(species)}/${encodeURIComponent(symbol)}?content-type=application/json`, {
    headers: { 'User-Agent': 'mrfentmen-ensembl-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Ensembl returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const s = (k: string) => (d[k] != null ? String(d[k]) : '');
  return [
    `${s('display_name')} (${s('id')})`,
    s('description') ? `Description: ${s('description')}` : '',
    `Type: ${s('biotype')} | ${s('start')}-${s('end')} on ${s('seq_region_name')} (${s('strand') === '1' ? '+' : '-'})`,
    s('assembly_name') ? `Assembly: ${s('assembly_name')}` : '',
  ].filter(Boolean).join('\n');
}

export async function sequence(args: SeqArgs): Promise<string> {
  const id = (args.id ?? '').trim();
  if (!id) return 'Provide a stable id.';
  const res = await fetch(`${BASE}/sequence/id/${encodeURIComponent(id)}?content-type=application/json`, {
    headers: { 'User-Agent': 'mrfentmen-ensembl-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Ensembl returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const seq = String(d.seq ?? '');
  return [
    `Sequence for ${id} (${seq.length} bases):`,
    seq.slice(0, 200) + (seq.length > 200 ? '...' : ''),
  ].filter(Boolean).join('\n');
}
