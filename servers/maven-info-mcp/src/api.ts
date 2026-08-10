const BASE = "https://search.maven.org/solrsearch/select"
const UA = "mrfentmen-maven-info-mcp/1.0 (https://github.com/mrfentmen)"
export class MavenError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new MavenError(`Maven Central returned HTTP ${res.status}`)
  return (await res.json()) as T
}

function fmtDoc(d: any, i: number): string {
  const ts = d?.timestamp ? new Date(d.timestamp).toISOString().slice(0, 10) : ""
  const latest = d?.latestVersion ?? ""
  return `${i + 1}. ${d?.id ?? "n/a"}\n   Latest ${latest} | versions ${d?.versionCount ?? 0} | ${ts}`
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new MavenError("Provide a search query")
  const limit = Math.min(args.limit ?? 10, 20)
  const d = await get<any>(`${BASE}?q=${encodeURIComponent(q)}&rows=${limit}&wt=json`)
  const docs = (d?.response?.docs ?? []) as any[]
  const total = d?.response?.numFound ?? 0
  if (!docs.length) return "No artifacts found"
  return `Maven Central results for \"${q}\" (${total} total):\n` + docs.map(fmtDoc).join("\n")
}

export async function artifact(args: { groupId?: string; artifactId?: string }): Promise<string> {
  const g = (args.groupId ?? "").trim()
  const a = (args.artifactId ?? "").trim()
  if (!g || !a) throw new MavenError("Provide both groupId and artifactId")
  const d = await get<any>(`${BASE}?q=g:${encodeURIComponent(g)}+AND+a:${encodeURIComponent(a)}&rows=1&wt=json`)
  const doc = d?.response?.docs?.[0]
  if (!doc) throw new MavenError(`Artifact not found: ${g}:${a}`)
  const lines = [
    `Artifact: ${doc?.id ?? `${g}:${a}`}`,
    `Latest version: ${doc?.latestVersion ?? "n/a"}`,
    `Versions: ${doc?.versionCount ?? "n/a"}`,
  ]
  if (doc?.timestamp) lines.push(`Last updated: ${new Date(doc.timestamp).toISOString().slice(0, 10)}`)
  return lines.join("\n")
}
