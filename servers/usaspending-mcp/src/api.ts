const m0 = (() => {
const BASE = "https://api.usaspending.gov/api/v2"
const UA = "mrfentmen-usaspending-mcp/1.0 (https://github.com/mrfentmen)"
const AWARD_CODES = ["A", "B", "C", "D"]
class SpendingError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new SpendingError(`USAspending returned HTTP ${res.status}`)
  return (await res.json()) as T
}

async function agencies(_args?: unknown): Promise<string> {
  const d = await get<any>(`${BASE}/references/toptier_agencies/`)
  const results = (d?.results ?? []) as any[]
  if (!results.length) return "No agencies found"
  return `Top tier federal agencies (${results.length}):\n` + results.slice(0, 40).map((a, i) => {
    const top = a?.toptier_agency ?? {}
    const ob = a?.total_obligation != null ? ` | obligated ${Math.round(a.total_obligation).toLocaleString()}` : ""
    return `${i + 1}. ${top?.name ?? "n/a"} (${top?.code ?? ""})${ob}`
  }).join("\n")
}

async function searchAwards(args: { keyword?: string; limit?: number }): Promise<string> {
  const kw = (args.keyword ?? "").trim()
  if (!kw) throw new SpendingError("Provide an award keyword")
  const limit = Math.min(args.limit ?? 8, 20)
  const body = {
    filters: { keywords: [kw], award_type_codes: AWARD_CODES },
    fields: ["Award ID", "Recipient Name", "Award Amount", "Awarding Agency", "Description", "Start Date", "End Date"],
    limit,
    page: 1,
  }
  const res = await fetch(`${BASE}/search/spending_by_award/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": UA, Accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
  })
  if (!res.ok) throw new SpendingError(`USAspending search returned HTTP ${res.status}`)
  const d = (await res.json()) as { results?: any[] }
  const items = (d?.results ?? []) as any[]
  if (!items.length) return `No awards found for \"${kw}\"`
  return `Federal awards matching \"${kw}\":\n` + items.map((a, i) => {
    const amount = a?.["Award Amount"] != null ? `$${Math.round(a["Award Amount"]).toLocaleString()}` : "n/a"
    return `${i + 1}. ${a?.["Award ID"] ?? "n/a"} | ${amount} | ${a?.["Recipient Name"] ?? "n/a"}\n   ${(a?.["Description"] ?? "no description").slice(0, 160)}`
  }).join("\n")
}

return { SpendingError, agencies, searchAwards };
})();

const m1 = (() => {
class ProcurementError extends Error {}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "mrfentmen-procurement-mcp/1.0" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new ProcurementError(`USAspending error ${res.status}`)
  return (await res.json()) as T
}

async function federalAwards(args: { query?: string; limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 25)
  const d = await post<any>("https://api.usaspending.gov/api/v2/search/spending_by_award/", {
    filters: { keywords: [args.query ?? ""], award_type_codes: ["A", "B", "C", "D"] },
    fields: ["Award ID", "Recipient Name", "Award Amount", "Awarding Agency", "Description", "Start Date"],
    limit,
    sort: "Award Amount",
    order: "desc",
  })
  const rows = d.results ?? []
  return rows.map((r: any) =>
    `${r["Award ID"] ?? ""} | $${Number(r["Award Amount"] ?? 0).toLocaleString()}\n  ${r["Recipient Name"] ?? ""} | ${r["Awarding Agency"] ?? ""}\n  ${(r["Description"] ?? "").slice(0, 160)}`
  ).join("\n\n") || "No awards found"
}

async function nonprofits(args: { query?: string; limit?: number }): Promise<string> {
  const q = encodeURIComponent(args.query ?? "")
  const res = await fetch(`https://projects.propublica.org/nonprofits/api/v2/search.json?q=${q}`, {
    headers: { "User-Agent": "mrfentmen-procurement-mcp/1.0" },
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new ProcurementError(`ProPublica error ${res.status}`)
  const d = await res.json()
  const rows = (d.organizations ?? []).slice(0, Math.min(args.limit ?? 10, 25))
  return rows.map((r: any) =>
    `${r.name ?? ""} | EIN ${r.ein ?? ""}\n  ${r.city ?? ""}, ${r.state ?? ""} | ${r.ntee_code ?? ""} | Rev $${Number(r.revenue_amount ?? 0).toLocaleString()}`
  ).join("\n\n") || "No nonprofits found"
}

return { ProcurementError, federalAwards, nonprofits };
})();

export const ProcurementError = m1.ProcurementError;
export const SpendingError = m0.SpendingError;
export const agencies = m0.agencies;
export const federalAwards = m1.federalAwards;
export const nonprofits = m1.nonprofits;
export const searchAwards = m0.searchAwards;
export const m0_agencies = m0.agencies;
export const m0_SpendingError = m0.SpendingError;
export const m0_searchAwards = m0.searchAwards;
export const m1_nonprofits = m1.nonprofits;
export const m1_ProcurementError = m1.ProcurementError;
export const m1_federalAwards = m1.federalAwards;
