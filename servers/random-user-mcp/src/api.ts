const UA = "mrfentmen-random-user-mcp/1.0 (https://github.com/mrfentmen)"
const BASE = "https://randomuser.me/api"

export class RandomUserError extends Error {}

async function get(count: number, gender: string, nat: string, seed: string): Promise<any> {
  const params = new URLSearchParams({ results: String(count) })
  if (gender && (gender === "male" || gender === "female")) params.set("gender", gender)
  if (nat) params.set("nat", nat)
  if (seed) params.set("seed", seed)
  const res = await fetch(`${BASE}/?${params.toString()}`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new RandomUserError(`RandomUser returned HTTP ${res.status}`)
  const d = (await res.json()) as { results: any[] }
  return d.results ?? []
}

function formatUser(u: any, i: number): string {
  const name = `${u.name?.first ?? ""} ${u.name?.last ?? ""}`.trim()
  return [
    `${i + 1}. ${name}`,
    `   ${u.gender ?? "n/a"} | ${u.dob?.age ?? "n/a"} years old | ${u.nat ?? "n/a"}`,
    `   Email: ${u.email ?? "n/a"}`,
    `   Location: ${u.location?.city ?? "n/a"}, ${u.location?.country ?? "n/a"}`,
    `   Phone: ${u.phone ?? "n/a"}`,
  ].join("\n")
}

export async function generate(args: { count?: number; gender?: string; nat?: string }): Promise<string> {
  const count = Math.min(args.count ?? 1, 20)
  const users = await get(count, (args.gender ?? "").trim(), (args.nat ?? "").trim(), "")
  if (!users.length) throw new RandomUserError("No profiles generated")
  return users.map((u: any, i: number) => formatUser(u, i)).join("\n")
}

export async function seed(args: { seed?: string; count?: number }): Promise<string> {
  const seed = (args.seed ?? "").trim()
  if (!seed) throw new RandomUserError("Provide a seed value")
  const count = Math.min(args.count ?? 1, 20)
  const users = await get(count, "", "", seed)
  if (!users.length) throw new RandomUserError("No profiles generated")
  return users.map((u: any, i: number) => formatUser(u, i)).join("\n")
}
