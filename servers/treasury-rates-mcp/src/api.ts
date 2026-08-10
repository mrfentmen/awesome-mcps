const BASE = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange"
const UA = "mrfentmen-treasury-rates-mcp/1.0 (https://github.com/mrfentmen)"
export class TreasuryError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new TreasuryError(`Treasury returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function rates(args: { country?: string; limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 25)
  const country = (args.country ?? "").trim()
  let url = `${BASE}?fields=country_currency_desc,currency,exchange_rate,record_date&sort=-record_date&page[size]=${limit}`
  if (country) {
    url = `${BASE}?fields=country_currency_desc,currency,exchange_rate,record_date&filter=country_currency_desc:eq:${encodeURIComponent(country)}&sort=-record_date&page[size]=${limit}`
  }
  const d = await get<any>(url)
  const rows = (d?.data ?? []) as any[]
  if (!rows.length) return country ? `No rates found for ${country}` : "No rates found"
  const lines = rows.map((r: any, i: number) => {
    const rate = r?.exchange_rate != null ? Number(r.exchange_rate).toFixed(4) : "n/a"
    return `${i + 1}. ${r?.country_currency_desc ?? "n/a"} | ${r?.currency ?? ""} | ${rate} per USD | ${r?.record_date?.slice(0, 10) ?? ""}`
  })
  return `US Treasury exchange rates${country ? ` for ${country}` : ""} (newest first):\n` + lines.join("\n")
}
