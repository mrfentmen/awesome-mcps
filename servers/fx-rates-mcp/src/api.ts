const BASE = "https://api.frankfurter.app"
export class FxError extends Error {}

export async function latestRates(args: { base?: string; to?: string }): Promise<string> {
  const base = (args.base ?? "USD").toUpperCase()
  const to = args.to ? `&to=${args.to.toUpperCase()}` : ""
  const res = await fetch(`${BASE}/latest?from=${base}${to}`, { redirect: "follow", signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new FxError(`Frankfurter error ${res.status}`)
  const d = await res.json()
  const rates = Object.entries(d.rates ?? {}).map(([k, v]) => `${k}: ${(v as number).toFixed(4)}`).join("\n")
  return `Rates for ${d.base} on ${d.date}\n${rates}`
}

export async function convert(args: { amount?: number; from?: string; to?: string }): Promise<string> {
  const amount = args.amount ?? 1
  const from = (args.from ?? "USD").toUpperCase()
  const to = (args.to ?? "EUR").toUpperCase()
  if (amount <= 0) throw new FxError("Amount must be positive")
  const res = await fetch(`${BASE}/latest?amount=${amount}&from=${from}&to=${to}`, { redirect: "follow", signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new FxError(`Frankfurter error ${res.status}`)
  const d = await res.json()
  const rate = d.rates?.[to]
  if (rate === undefined) throw new FxError(`No rate for ${to}`)
  return `${amount} ${from} = ${Number(rate).toFixed(4)} ${to} (rate ${(Number(rate) / amount).toFixed(6)})`
}
