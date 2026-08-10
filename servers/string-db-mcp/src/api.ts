const BASE = 'https://string-db.org/api/tsv/network';

export interface NetworkArgs {
  proteins: string;
  species?: number;
}

export async function network(args: NetworkArgs): Promise<string> {
  const proteins = (args.proteins ?? '').trim();
  if (!proteins) return 'Provide protein gene names separated by commas.';
  const species = args.species ?? 9606;
  const params = new URLSearchParams({ identifiers: proteins, species: String(species) });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { 'User-Agent': 'mrfentmen-string-db-mcp/1.0', Accept: 'text/tab-separated-values' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`STRING DB returned ${res.status}`);
  const text = await res.text();
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length <= 1) return `No interactions found for ${proteins}.`;
  const header = lines[0].split('\t');
  const rows = lines.slice(1, 11).map((l) => l.split('\t'));
  const get = (r: string[], k: string) => r[header.indexOf(k)] ?? '';
  return `Interactions for ${proteins} (${rows.length} shown):\n` +
    rows
      .map((r, i) => `${i + 1}. ${get(r, 'preferredName_A')} <-> ${get(r, 'preferredName_B')} | score ${Number(get(r, 'score')).toFixed(2)}`)
      .join('\n');
}
