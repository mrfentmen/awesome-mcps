const UA = "mrfentmen-clinical-trials-mcp/1.0 (https://github.com/mrfentmen)"
export class TrialsError extends Error {}

async function get<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, ...headers }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new TrialsError(`API error ${res.status}`)
  return (await res.json()) as T
}

export async function clinicalTrials(args: { query?: string; limit?: number }): Promise<string> {
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

export async function trial(args: { nct_id?: string }): Promise<string> {
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

export async function pubmed(args: { query?: string; limit?: number }): Promise<string> {
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
