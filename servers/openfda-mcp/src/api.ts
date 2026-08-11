
export interface m1_EventsArgs {
  drug: string;
  limit?: number;
}

const m0 = (() => {
const BASE = "https://api.fda.gov"
class FdaError extends Error {}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new FdaError(`openFDA error ${res.status}`)
  return (await res.json()) as T
}

async function drugRecalls(args: { search?: string; limit?: number }): Promise<string> {
  const search = args.search ? `&search=${encodeURIComponent(args.search)}` : ""
  const limit = Math.min(args.limit ?? 10, 50)
  const d = await request<any>(`/drug/enforcement.json?limit=${limit}${search}`)
  const rows = d.results ?? []
  return rows.map((r: any) => `${r.status ?? ""} | ${r.recall_number ?? ""}\n  ${r.product_description ?? ""}\n  Reason: ${r.reason_for_recall ?? ""}\n  ${r.classification ?? ""}`).join("\n\n") || "No recalls found"
}

async function adverseEvents(args: { drug?: string; limit?: number }): Promise<string> {
  const drug = encodeURIComponent(args.drug ?? "")
  const limit = Math.min(args.limit ?? 10, 50)
  const d = await request<any>(`/drug/event.json?search=patient.drug.medicinalproduct:"${drug}"&limit=${limit}`)
  const rows = d.results ?? []
  return rows.map((r: any, i: number) => {
    const rx = r.patient?.drug?.[0]
    return `${i + 1}. ${rx?.medicinalproduct ?? "unknown drug"} | ${r.seriousnessdeath ? "DEATH" : r.seriousnesshospitalization ? "HOSPITAL" : "report"}\n   Reactions: ${(r.patient?.reaction ?? []).map((x: any) => x.reactionmeddrapt).join(", ") || "none listed"}`
  }).join("\n\n") || "No adverse events found"
}

async function approvedDrugs(args: { query?: string; limit?: number }): Promise<string> {
  const q = encodeURIComponent(args.query ?? "")
  const limit = Math.min(args.limit ?? 10, 50)
  const d = await request<any>(`/drug/drugsfda.json?search=openfda.brand_name:"${q}"+OR+openfda.generic_name:"${q}"&limit=${limit}`)
  const rows = d.results ?? []
  return rows.map((r: any) => {
    const o = r.openfda ?? {}
    return `${o.brand_name?.[0] ?? "unknown brand"} | ${o.generic_name?.[0] ?? ""}\n  Application ${r.application_number ?? ""} | ${o.route?.[0] ?? ""} | ${o.manufacturer_name?.[0] ?? ""}`
  }).join("\n\n") || "No approved drugs found"
}

return { FdaError, adverseEvents, approvedDrugs, drugRecalls };
})();

const m1 = (() => {
const BASE = 'https://api.fda.gov/drug/event.json';


async function events(args: m1_EventsArgs): Promise<string> {
  const drug = (args.drug ?? '').trim();
  if (!drug) return 'Provide a drug brand name.';
  const limit = Math.max(1, Math.min(args.limit ?? 5, 20));
  const query = `patient.drug.openfda.brand_name:"${drug}"`;
  const url = `${BASE}?search=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-daily-med-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`openFDA returned ${res.status}`);
  const data = (await res.json()) as {
    meta?: { results?: { total?: number } };
    results?: Array<Record<string, unknown>>;
  };
  const rows = data.results ?? [];
  if (!rows.length) return `No FDA event reports found for "${drug}".`;
  return `FDA adverse event reports for "${drug}" (${data.meta?.results?.total ?? rows.length} total, ${rows.length} shown):\n` +
    rows
      .map((r, i) => {
        const serious = (r.serious as boolean | undefined) ? 'SERIOUS' : 'not serious';
        const reportDate = r.report_date ? String(r.report_date) : '';
        return `${i + 1}. ${reportDate || 'no date'} | ${serious}${r.reaction ? ` | ${JSON.stringify(r.reaction).slice(0, 100)}` : ''}`;
      })
      .join('\n');
}

return { events };
})();

export const FdaError = m0.FdaError;
export const adverseEvents = m0.adverseEvents;
export const approvedDrugs = m0.approvedDrugs;
export const drugRecalls = m0.drugRecalls;
export const events = m1.events;
export const m0_adverseEvents = m0.adverseEvents;
export const m0_FdaError = m0.FdaError;
export const m0_approvedDrugs = m0.approvedDrugs;
export const m0_drugRecalls = m0.drugRecalls;
export const m1_events = m1.events;
