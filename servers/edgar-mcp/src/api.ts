const UA = "mrfentmen edgar mcp research contact@example.com"
export class EdgarError extends Error {}

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new EdgarError(`SEC EDGAR error ${res.status}`)
  return (await res.json()) as T
}

async function resolveCik(ticker: string): Promise<string> {
  const t = ticker.trim().toUpperCase()
  if (/^\d+$/.test(t)) return t.padStart(10, "0")
  const map = await request<Record<string, { cik_str: number; ticker: string; title: string }>>(
    "https://www.sec.gov/files/company_tickers.json"
  )
  for (const row of Object.values(map)) {
    if ((row.ticker ?? "").toUpperCase() === t) return String(row.cik_str).padStart(10, "0")
  }
  throw new EdgarError(`Ticker ${t} not found in SEC company list`)
}

function cikUrl(cik: string): string {
  return `https://data.sec.gov/submissions/CIK${cik}.json`
}

export async function companyFilings(args: { ticker?: string }): Promise<string> {
  const cik = await resolveCik(args.ticker ?? "")
  const d = await request<any>(cikUrl(cik))
  const r = d.filings?.recent
  const rows = (r?.form ?? []).map((form: string, i: number) => {
    const date = r.filingDate?.[i] ?? ""
    const acc = r.accessionNumber?.[i] ?? ""
    const doc = r.primaryDocument?.[i] ?? ""
    return `${form} ${date} | ${acc} | ${doc}`
  })
  return `${d.name ?? cik} (CIK ${cik})\n${rows.slice(0, 20).join("\n")}`
}

export async function companyFacts(args: { ticker?: string }): Promise<string> {
  const cik = await resolveCik(args.ticker ?? "")
  const d = await request<any>(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`)
  const facts = d.facts?.usGaap ?? {}
  const pick = ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax", "NetIncomeLoss", "Assets", "Liabilities", "StockholdersEquity", "EarningsPerShareBasic"]
  const out: string[] = []
  for (const key of pick) {
    const f = facts[key]
    if (!f) continue
    const units = Object.values(f.units ?? {}) as any[][]
    const latest = units.flat().slice(-1)[0]
    if (latest) out.push(`${key}: ${latest.val ?? "n/a"} (${latest.end ?? ""})`)
  }
  return `${d.entityName ?? cik}\n${out.join("\n") || "No common XBRL facts found"}`
}

export async function searchFilings(args: { query?: string; limit?: number }): Promise<string> {
  const q = encodeURIComponent(args.query ?? "")
  const d = await request<any>(`https://efts.sec.gov/LATEST/search-index?q=${q}&dateRange=custom&startdt=2024-01-01&enddt=2030-12-31`)
  const hits = d.hits?.hits ?? []
  const limit = Math.min(args.limit ?? 10, 25)
  return hits.slice(0, limit).map((h: any) => {
    const s = h._source ?? {}
    return `${s.file_date ?? ""} ${s.form_type ?? ""} | ${s.display_names?.[0] ?? s.entity_name ?? ""}\n  ${(s.description ?? "").slice(0, 200)}`
  }).join("\n\n") || "No filings found"
}
