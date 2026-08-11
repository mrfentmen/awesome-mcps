
export interface m0_SearchArgs {
  query: string;
  limit?: number;
}

const m0 = (() => {
const BASE = 'https://clinicaltrials.gov/api/v2/studies';


async function search(args: m0_SearchArgs): Promise<string> {
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

return { search };
})();

const m1 = (() => {
const UA = "mrfentmen-clinical-trials-mcp/1.0 (https://github.com/mrfentmen)"
class TrialsError extends Error {}

async function get<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, ...headers }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new TrialsError(`API error ${res.status}`)
  return (await res.json()) as T
}

async function clinicalTrials(args: { query?: string; limit?: number }): Promise<string> {
  const q = encodeURIComponent(args.query ?? "")
  const limit = Math.min(args.limit ?? 10, 25)
  const d = await get<any>(`https://clinicaltrials.gov/api/v2/studies?query.term=${q}&pageSize=${limit}`)
  const rows = d.studies ?? []
  return rows.map((s: any) => {
    const p = s.protocolSection
    const id = p?.identificationModule?.nctId ?? ""
    const title = p?.identificationModule?.briefTitle ?? ""
    const status = p?.statusModule?.overallStatus ?? ""
    const conds = (p?.conditionsModule?.conditions ?? []).join(", ")
    return `${id} | ${status}\n  ${title}\n  ${conds}`
  }).join("\n\n") || "No trials found"
}

async function trial(args: { nct_id?: string }): Promise<string> {
  const id = args.nct_id ?? ""
  if (!id) throw new TrialsError("Provide an NCT id")
  const d = await get<any>(`https://clinicaltrials.gov/api/v2/studies/${id}`)
  const p = d.protocolSection
  return [
    `${p?.identificationModule?.nctId} | ${p?.statusModule?.overallStatus}`,
    p?.identificationModule?.briefTitle ?? "",
    p?.descriptionModule?.briefSummary ?? "",
    `Conditions: ${(p?.conditionsModule?.conditions ?? []).join(", ")}`,
    `Sponsor: ${p?.sponsorCollaboratorsModule?.leadSponsor?.name ?? ""}`,
    `Phase: ${(p?.designModule?.phases ?? []).join(", ")}`,
  ].filter(Boolean).join("\n")
}

async function pubmed(args: { query?: string; limit?: number }): Promise<string> {
  const q = encodeURIComponent(args.query ?? "")
  const limit = Math.min(args.limit ?? 10, 25)
  const esearch = await get<any>(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${q}&retmax=${limit}&retmode=json`)
  const ids = esearch.esearchresult?.idlist ?? []
  if (!ids.length) return "No PubMed articles found"
  const esummary = await get<any>(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`)
  const docs = esummary.result ?? {}
  return ids.map((id: string) => {
    const doc = docs[id] ?? {}
    const authors = (doc.authors ?? []).slice(0, 3).map((a: any) => a.name).join(", ")
    return `${doc.title ?? ""}\n  ${authors} | ${doc.fulljournalname ?? ""} (${doc.pubdate ?? ""}) | PMID ${id}`
  }).join("\n\n")
}

return { TrialsError, clinicalTrials, pubmed, trial };
})();

export const TrialsError = m1.TrialsError;
export const clinicalTrials = m1.clinicalTrials;
export const pubmed = m1.pubmed;
export const search = m0.search;
export const trial = m1.trial;
export const m0_search = m0.search;
export const m1_clinicalTrials = m1.clinicalTrials;
export const m1_TrialsError = m1.TrialsError;
export const m1_pubmed = m1.pubmed;
export const m1_trial = m1.trial;
