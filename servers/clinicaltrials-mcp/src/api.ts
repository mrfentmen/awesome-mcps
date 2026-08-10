const BASE = 'https://clinicaltrials.gov/api/v2/studies';

export interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search(args: SearchArgs): Promise<string> {
  const q = (args.query ?? '').trim();
  if (!q) return 'Provide a search query.';
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const url = `${BASE}?query.term=${encodeURIComponent(q)}&pageSize=${limit}&fields=NCTId,BriefTitle,OverallStatus,LeadSponsorName,StartDate`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-clinicaltrials-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`ClinicalTrials.gov returned ${res.status}`);
  const data = (await res.json()) as {
    totalCount?: number;
    studies?: Array<Record<string, unknown>>;
  };
  const rows = data.studies ?? [];
  if (!rows.length) return `No clinical trials found for "${q}".`;
  return `Clinical trials for "${q}" (${data.totalCount ?? rows.length} total, ${rows.length} shown):\n` +
    rows
      .map((s, i) => {
        const protocol = (s.protocolSection ?? {}) as Record<string, unknown>;
        const idModule = (protocol.identificationModule ?? {}) as Record<string, unknown>;
        const statusModule = (protocol.statusModule ?? {}) as Record<string, unknown>;
        const sponsor = (protocol.sponsorCollaboratorsModule ?? {}) as Record<string, unknown>;
        const leadOrg = (sponsor.leadSponsor ?? {}) as Record<string, unknown> | undefined;
        return `${i + 1}. ${idModule.briefTitle ?? 'untitled'} | ${statusModule.overallStatus ?? ''} | ${leadOrg?.name ?? ''} | ${idModule.nctId ?? ''}`;
      })
      .join('\n');
}
