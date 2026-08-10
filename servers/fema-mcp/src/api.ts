const BASE = 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries';

export interface DeclarationsArgs {
  state: string;
  limit?: number;
}

export async function declarations(args: DeclarationsArgs): Promise<string> {
  const state = (args.state ?? '').trim().toUpperCase();
  if (!state) return 'Provide a state code like CA or TX.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 50));
  const url = `${BASE}?%24filter=state%20eq%20%27${state}%27&%24orderby=declarationDate%20desc&%24top=${limit}&%24format=json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-fema-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`FEMA returned ${res.status}`);
  const data = (await res.json()) as {
    metadata?: { count?: number };
    DisasterDeclarationsSummaries?: Array<Record<string, unknown>>;
  };
  const rows = data.DisasterDeclarationsSummaries ?? [];
  if (!rows.length) return `No FEMA disaster declarations found for ${state}.`;
  return `FEMA disaster declarations for ${state} (${data.metadata?.count ?? rows.length} total, ${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const date = r.declarationDate ? String(r.declarationDate).slice(0, 10) : '';
        return `${i + 1}. ${r.disasterType ?? ''} | ${r.incidentType ?? ''} | ${r.declarationTitle ?? 'untitled'}${date ? ` | ${date}` : ''}`;
      })
      .join('\n');
}
