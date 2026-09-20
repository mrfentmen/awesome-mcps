/**
 * LanguageTool public API client, keyless (fair-use limits).
 * Docs: https://languagetool.org/http-api/rest-api
 */
const BASE = "https://api.languagetool.org/v2"

export class LanguageToolError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

export interface Match {
  message: string
  short?: string
  offset: number
  length: number
  fragment: string
  suggestions: string[]
  rule?: string
  category?: string
}

export interface CheckResult {
  matches: Match[]
  truncated: boolean
}

export async function checkText(text: string, language = "auto"): Promise<CheckResult> {
  if (!text || !text.trim()) throw new LanguageToolError("Text is empty.")
  if (text.length > 20000) throw new LanguageToolError("Text too long (max 20000 chars on the public API).")
  const body = new URLSearchParams({ text, language, enabledOnly: "false" })
  const res = await fetch(`${BASE}/check`, {
    method: "POST",
    headers: { "User-Agent": "languagetool-mcp/1.0", "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: body.toString(),
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new LanguageToolError(`LanguageTool error ${res.status}`)
  const data = (await res.json()) as Raw
  const matches: Raw[] = Array.isArray(data.matches) ? data.matches : []
  return {
    truncated: Boolean(data?.warnings?.incompleteResults),
    matches: matches.slice(0, 15).map((m) => {
      const ctx = (m.context ?? {}) as Raw
      const reps: Raw[] = Array.isArray(m.replacements) ? m.replacements : []
      return {
        message: String(m.message ?? "?"),
        short: m.shortMessage ? String(m.shortMessage) : undefined,
        offset: Number(m.offset ?? 0),
        length: Number(m.length ?? 0),
        fragment: String(ctx.text ?? "").slice(
          Math.max(0, Number(ctx.offset ?? 0)), Number(ctx.offset ?? 0) + Number(ctx.length ?? 0)
        ).slice(0, 120),
        suggestions: reps.slice(0, 3).map((r) => String(r.value)),
        rule: (m.rule as Raw)?.id ? String((m.rule as Raw).id) : undefined,
        category: ((m.rule as Raw)?.category as Raw)?.name ? String(((m.rule as Raw).category as Raw).name) : undefined,
      }
    }),
  }
}

export interface Language {
  code: string
  name: string
}

export async function listLanguages(): Promise<Language[]> {
  const rows = await fetch(`${BASE}/languages`, {
    headers: { "User-Agent": "languagetool-mcp/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  }).then((r) => {
    if (!r.ok) throw new LanguageToolError(`LanguageTool error ${r.status}`)
    return r.json() as Promise<Raw[]>
  })
  return rows.map((l) => ({ code: String(l.longCode ?? l.code), name: String(l.name ?? l.code) }))
}

export function formatResult(r: CheckResult): string {
  if (r.matches.length === 0) return "No issues found."
  const lines = r.matches.map((m, i) => {
    const sug = m.suggestions.length ? ` → try: ${m.suggestions.join(", ")}` : ""
    const where = m.fragment ? ` ("...${m.fragment}...")` : ""
    return `${i + 1}. ${m.message}${m.category ? ` [${m.category}]` : ""}${where}${sug}`
  })
  if (r.truncated) lines.push("(results truncated by the API)")
  return `Found ${r.matches.length} issue${r.matches.length === 1 ? "" : "s"}:\n\n${lines.join("\n")}`
}
