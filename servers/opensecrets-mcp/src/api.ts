/**
 * OpenSecrets API client. Needs OPENSECRETS_API_KEY
 * (free at https://www.opensecrets.org/api/).
 * Docs: https://www.opensecrets.org/resources/create/apis.php
 */
const BASE = "https://www.opensecrets.org/api"

export class OpenSecretsError extends Error {}

function apiKey(): string {
  const k = process.env.OPENSECRETS_API_KEY
  if (!k) throw new OpenSecretsError("Set OPENSECRETS_API_KEY first (free at opensecrets.org/api).")
  return k
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ ...params, apikey: apiKey(), output: "json" }).toString()
  const res = await fetch(`${BASE}/?${qs}`, {
    headers: { "User-Agent": "opensecrets-mcp/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(25000),
  })
  if (res.status === 401 || res.status === 403) throw new OpenSecretsError("OpenSecrets refused (401/403). Check API key.")
  if (!res.ok) throw new OpenSecretsError(`OpenSecrets error ${res.status}`)
  return (await res.json()) as T
}

export interface Candidate {
  id?: string
  name?: string
  party?: string
  state?: string
  chamber?: string
}

export async function searchCandidates(query: string, cycle = "2024"): Promise<Candidate[]> {
  if (!query.trim()) throw new OpenSecretsError("Query is empty.")
  const data = await getJson<Raw>({ method: "getLegislators", id: query.trim() })
  const rows: Raw[] = Array.isArray(data.response?.legislator) ? data.response.legislator : []
  const attrs = (r: Raw): Raw => r["@attributes"] ?? {}
  return rows.slice(0, 10).map((r) => {
    const a = attrs(r)
    return {
      id: a.cid,
      name: `${a.firstname ?? ""} ${a.lastname ?? ""}`.trim() || undefined,
      party: a.party,
      state: a.state,
      chamber: a.chamber,
    }
  })
}

export async function candidateSummary(cid: string, cycle = "2024"): Promise<string> {
  if (!cid.trim()) throw new OpenSecretsError("Candidate id is empty.")
  const data = await getJson<Raw>({ method: "candSummary", cid: cid.trim(), cycle })
  const a: Raw = data.response?.summary?.["@attributes"] ?? {}
  if (!a.candidate_name) throw new OpenSecretsError(`No summary for ${cid} in ${cycle}.`)
  return [
    `${a.candidate_name ?? cid}${a.party ? ` (${a.party}-${a.state ?? "?"})` : ""} — ${cycle} cycle`,
    `Raised: $${Number(a.total ?? 0).toLocaleString()}`,
    `Spent: $${Number(a.spent ?? 0).toLocaleString()}`,
    `Cash on hand: $${Number(a.cash_on_hand ?? 0).toLocaleString()}`,
    `Debt: $${Number(a.debt ?? 0).toLocaleString()}`,
    a.source ? `Source: ${a.source}` : "",
  ].filter(Boolean).join("\n")
}

export function formatCandidate(c: Candidate, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${c.id ?? "?"}] ${c.name ?? "(unnamed)"}${c.party ? ` (${c.party}${c.state ? `-${c.state}` : ""})` : ""}${c.chamber ? ` — ${c.chamber}` : ""}`
}
