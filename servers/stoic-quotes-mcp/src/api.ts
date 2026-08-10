const UA = "mrfentmen-stoic-quotes-mcp/1.0 (https://github.com/mrfentmen)"

export class StoicError extends Error {}

async function one(): Promise<{ text: string; author: string }> {
  const res = await fetch("https://stoic-quotes.com/api/quote", {
    headers: { "User-Agent": UA, Accept: "application/json" },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new StoicError(`Stoic Quotes returned HTTP ${res.status}`)
  return (await res.json()) as { text: string; author: string }
}

export async function random(_args?: unknown): Promise<string> {
  const q = await one()
  return `"${q.text}"\n  ${q.author ?? "unknown"}`
}

export async function many(args: { count?: number }): Promise<string> {
  const count = Math.min(args.count ?? 3, 10)
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    const q = await one()
    out.push(`${i + 1}. "${q.text}" ${q.author ?? "unknown"}`)
  }
  return out.join("\n\n")
}
