const BASE = "https://api.usaspending.gov/api/v2"
const UA = "mrfentmen-usaspending-mcp/1.0 (https://github.com/mrfentmen)"
const AWARD_CODES = ["A", "B", "C", "D"]
export class SpendingError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new SpendingError(`USAspending returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function agencies(_args?: unknown): Promise<string> {
  const d = await get<any>(`${BASE}/references/toptier_agencies/`)
  const results = (d?.results ?? []) as any[]
  if (!results.length) return "No agencies found"
  return `Top tier federal agencies (${results.length}):\n` + results.slice(0, 40).map((a, i) => {
    const top = a?.toptier_agency ?? {}
    const ob = a?.total_obligation != null ? ` | obligated ${Math.round(a.total_obligation).toLocaleString()}` : ""
    return `${i + 1}. ${top?.name ?? "n/a"} (${top?.code ?? ""})${ob}`
  }).join("\n")
}

export async function searchAwards(args: { keyword?: string; limit?: number }): Promise<string> {
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
