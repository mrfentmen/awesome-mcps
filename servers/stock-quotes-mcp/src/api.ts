const UA = "mrfentmen-stock-quotes-mcp/1.0 (https://github.com/mrfentmen)"
export class StockError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new StockError(`Market data error ${res.status}`)
  return (await res.json()) as T
}

export async function quote(args: { symbol?: string; days?: number }): Promise<string> {
  const symbol = (args.symbol ?? "").trim().toUpperCase()
  if (!symbol) throw new StockError("Provide a stock symbol")
  const days = Math.min(Math.max(args.days ?? 10, 1), 365)
  const range = days <= 5 ? "5d" : days <= 30 ? "1mo" : days <= 90 ? "3mo" : "1y"
  const d = await get<any>(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d`)
  const r = d.chart?.result?.[0]
  if (!r) throw new StockError(`No data for ${symbol}`)
  const meta = r.meta ?? {}
  const quotes = r.indicators?.quote?.[0] ?? {}
  const closes = (quotes.close ?? []).filter((v: number | null) => v != null).slice(-days)
  const latest = closes[closes.length - 1]
  const prev = closes[closes.length - 2]
  const change = latest !== undefined && prev !== undefined ? ((latest - prev) / prev) * 100 : null
  const times = (r.timestamp ?? []).slice(-Math.min(closes.length, 5)).map((t: number) => new Date(t * 1000).toISOString().slice(0, 10))
  const recent = closes.slice(-5).map((c: number, i: number) => `${times[i] ?? "?"}: ${c ?? "n/a"}`).join("\n")
  return `${meta.shortName ?? meta.symbol ?? symbol} (${meta.symbol ?? ""}) ${meta.currency ?? ""}\nLatest: ${latest ?? "n/a"}${change !== null ? ` (${change >= 0 ? "+" : ""}${change.toFixed(2)}% vs prior close)` : ""}\nRecent closes:\n${recent}`
}

export async function searchSymbol(args: { query?: string }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new StockError("Provide a company name")
  const d = await get<any>(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`)
  const quotes = d.quotes ?? []
  return quotes.map((x: any) =>
    `${x.symbol ?? ""} | ${x.shortname ?? x.longname ?? ""} (${x.exchDisp ?? x.exchange ?? ""})`
  ).join("\n") || "No symbols found"
}
