const UA = "mrfentmen-affirmations-mcp/1.0 (https://github.com/mrfentmen)"

export class AffirmationError extends Error {}

async function one(): Promise<string> {
  const res = await fetch("https://www.affirmations.dev/", { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new AffirmationError(`Affirmations API returned HTTP ${res.status}`)
  const d = (await res.json()) as { affirmation?: string }
  return d.affirmation ?? "Keep going"
}

export async function random(_args?: unknown): Promise<string> {
  return one()
}

export async function many(args: { count?: number }): Promise<string> {
  const count = Math.min(args.count ?? 3, 10)
  const seen = new Set<string>()
  while (seen.size < count) {
    seen.add(await one())
  }
  return [...seen].map((a, i) => `${i + 1}. ${a}`).join("\n")
}
