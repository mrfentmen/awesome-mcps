const BASE = "https://api.fda.gov"
export class FdaError extends Error {}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new FdaError(`openFDA error ${res.status}`)
  return (await res.json()) as T
}

export async function drugRecalls(args: { search?: string; limit?: number }): Promise<string> {
  const search = args.search ? `&search=${encodeURIComponent(args.search)}` : ""
  const limit = Math.min(args.limit ?? 10, 50)
  const d = await request<any>(`/drug/enforcement.json?limit=${limit}${search}`)
  const rows = d.results ?? []
  return rows.map((r: any) => `${r.status ?? ""} | ${r.recall_number ?? ""}\n  ${r.product_description ?? ""}\n  Reason: ${r.reason_for_recall ?? ""}\n  ${r.classification ?? ""}`).join("\n\n") || "No recalls found"
}

export async function adverseEvents(args: { drug?: string; limit?: number }): Promise<string> {
  const drug = encodeURIComponent(args.drug ?? "")
  const limit = Math.min(args.limit ?? 10, 50)
  const d = await request<any>(`/drug/event.json?search=patient.drug.medicinalproduct:"${drug}"&limit=${limit}`)
  const rows = d.results ?? []
  return rows.map((r: any, i: number) => {
    const rx = r.patient?.drug?.[0]
    return `${i + 1}. ${rx?.medicinalproduct ?? "unknown drug"} | ${r.seriousnessdeath ? "DEATH" : r.seriousnesshospitalization ? "HOSPITAL" : "report"}\n   Reactions: ${(r.patient?.reaction ?? []).map((x: any) => x.reactionmeddrapt).join(", ") || "none listed"}`
  }).join("\n\n") || "No adverse events found"
}

export async function approvedDrugs(args: { query?: string; limit?: number }): Promise<string> {
  const q = encodeURIComponent(args.query ?? "")
  const limit = Math.min(args.limit ?? 10, 50)
  const d = await request<any>(`/drug/drugsfda.json?search=openfda.brand_name:"${q}"+OR+openfda.generic_name:"${q}"&limit=${limit}`)
  const rows = d.results ?? []
  return rows.map((r: any) => {
    const o = r.openfda ?? {}
    return `${o.brand_name?.[0] ?? "unknown brand"} | ${o.generic_name?.[0] ?? ""}\n  Application ${r.application_number ?? ""} | ${o.route?.[0] ?? ""} | ${o.manufacturer_name?.[0] ?? ""}`
  }).join("\n\n") || "No approved drugs found"
}
