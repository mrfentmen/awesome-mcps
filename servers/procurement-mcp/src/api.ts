export class ProcurementError extends Error {}

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

export async function federalAwards(args: { query?: string; limit?: number }): Promise<string> {
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

export async function nonprofits(args: { query?: string; limit?: number }): Promise<string> {
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
