/**
 * Oyez API client, keyless.
 * Docs: https://github.com/oyez/oyez-api
 */
const BASE = "https://api.oyez.org"

export class OyezError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "oyez-mcp/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 404) throw new OyezError("Not found on Oyez.")
  if (!res.ok) throw new OyezError(`Oyez error ${res.status}`)
  return (await res.json()) as T
}

const clean = (s: unknown, max: number): string | undefined => {
  if (typeof s !== "string" || !s) return undefined
  const t = s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
  return t ? (t.length > max ? t.slice(0, max) + "..." : t) : undefined
}

export interface CaseHit {
  name: string
  term?: string
  docket?: string
  href?: string
}

export async function searchCases(query: string, limit = 5): Promise<CaseHit[]> {
  const rows = await getJson<Raw[]>(`/cases/search/${encodeURIComponent(query)}`)
  return rows.slice(0, limit).map((r) => ({
    name: clean(r.name, 120) ?? "?",
    term: r.term ? String(r.term) : undefined,
    docket: r.docket_number ? String(r.docket_number) : undefined,
    href: r.href,
  }))
}

export interface CaseDetails {
  name?: string
  docket?: string
  parties: string[]
  facts?: string
  question?: string
  conclusion?: string
  decisions: string[]
  audio: string[]
  url?: string
}

export async function getCase(term: string, docket: string): Promise<CaseDetails> {
  const c = await getJson<Raw>(`/cases/${encodeURIComponent(term.trim())}/${encodeURIComponent(docket.trim())}`)
  const decisions: Raw[] = Array.isArray(c.decisions) ? c.decisions : []
  const args: Raw[] = Array.isArray(c.oral_argument_audio) ? c.oral_argument_audio : []
  return {
    name: clean(c.name, 140),
    docket: c.docket_number ? String(c.docket_number) : undefined,
    parties: [c.first_party, c.second_party].filter((x) => typeof x === "string").map(String),
    facts: clean(c.facts_of_the_case, 500),
    question: clean(c.question, 300),
    conclusion: clean(c.conclusion, 300),
    decisions: decisions.slice(0, 6).map((d) => {
      const votes = d.votes ? ` (${String(d.votes)})` : ""
      const member = d.member ? ` — ${String((d.member as Raw).name ?? d.member)}` : ""
      return `${String(d.decision_type ?? "Decision")}${votes}${member}`
    }),
    audio: args.slice(0, 4).map((a) => String(a.href ?? a)).filter(Boolean),
    url: c.href ? String(c.href).replace("api.oyez.org", "www.oyez.org/cases") : undefined,
  }
}

export function formatHit(h: CaseHit, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}${h.name}${h.term && h.docket ? ` (term ${h.term}, docket ${h.docket})` : ""}`
}

export function formatCase(c: CaseDetails): string {
  const lines = [
    `${c.name ?? "(unnamed case)"}${c.docket ? ` [${c.docket}]` : ""}`,
    c.parties.length ? `Parties: ${c.parties.join(" v. ")}` : "",
    c.question ? `Question: ${c.question}` : "",
    c.conclusion ? `Conclusion: ${c.conclusion}` : "",
    c.decisions.length ? `Decisions:\n- ${c.decisions.join("\n- ")}` : "",
    c.audio.length ? `Oral argument audio:\n- ${c.audio.join("\n- ")}` : "",
    c.facts ? `Facts: ${c.facts}` : "",
    c.url ? `More: ${c.url}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}
