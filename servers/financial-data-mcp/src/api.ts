export class FinanceError extends Error {}

export async function fredSeries(args: { series_id?: string; limit?: number }): Promise<string> {
  const id = encodeURIComponent(args.series_id ?? "GDP")
  const res = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`, { signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new FinanceError(`FRED error ${res.status}`)
  const csv = await res.text()
  const rows = csv.trim().split("\n").slice(1)
  const limit = Math.min(args.limit ?? 20, 120)
  const tail = rows.slice(-limit)
  const lines = tail.map((r) => {
    const [date, ...rest] = r.split(",")
    return `${date}: ${rest.join(",")}`
  })
  return `FRED series ${args.series_id ?? "GDP"}\n${lines.join("\n") || "No data"}`
}

const TREASURY_FIELDS: Array<[string, string]> = [
  ["BC_1MONTH", "1 mo"],
  ["BC_2MONTH", "2 mo"],
  ["BC_3MONTH", "3 mo"],
  ["BC_4MONTH", "4 mo"],
  ["BC_6MONTH", "6 mo"],
  ["BC_1YEAR", "1 yr"],
  ["BC_2YEAR", "2 yr"],
  ["BC_3YEAR", "3 yr"],
  ["BC_5YEAR", "5 yr"],
  ["BC_7YEAR", "7 yr"],
  ["BC_10YEAR", "10 yr"],
  ["BC_20YEAR", "20 yr"],
  ["BC_30YEAR", "30 yr"],
]

export async function treasuryRates(_args: Record<string, never>): Promise<string> {
  const year = new Date().getFullYear()
  const res = await fetch(
    `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_yield_curve&field_tdr_date_value=${year}`,
    { signal: AbortSignal.timeout(25000) }
  )
  if (!res.ok) throw new FinanceError(`Treasury error ${res.status}`)
  const xml = await res.text()
  const entry = /<entry>([\s\S]*?)<\/entry>/.exec(xml)?.[1]
  if (!entry) throw new FinanceError("Treasury returned no rate data")
  const date = /<d:NEW_DATE>([^<]*)<\/d:NEW_DATE>/.exec(entry)?.[1] ?? ""
  const out = TREASURY_FIELDS.map(([field, label]) => {
    const re = new RegExp(`<d:${field}>([^<]*)</d:${field}>`)
    const v = re.exec(entry)?.[1] ?? "n/a"
    return `${label}: ${v === "n/a" ? v : v + "%"}`
  })
  return `US Treasury yield curve ${date.slice(0, 10)}\n${out.join("\n")}`
}
