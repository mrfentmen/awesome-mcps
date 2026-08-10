const BASE = "https://en.wiktionary.org/w/api.php"
const UA = "mrfentmen-wiktionary-mcp/1.0 (https://github.com/mrfentmen)"
export class WiktionaryError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new WiktionaryError("Wiktionary rate limit hit, wait and retry")
  if (!res.ok) throw new WiktionaryError(`Wiktionary error ${res.status}`)
  return (await res.json()) as T
}

export async function define(args: { word?: string }): Promise<string> {
  const word = (args.word ?? "").trim()
  if (!word) throw new WiktionaryError("Provide a word to look up")
  const d = await get<any>(`${BASE}?action=query&prop=extracts&titles=${encodeURIComponent(word)}&explaintext=1&format=json&origin=*`)
  const pages = d?.query?.pages ?? {}
  const page = Object.values(pages)[0] as any
  if (!page || page?.missing !== undefined) return `No entry for "${word}"`
  const extract = page?.extract ?? ""
  if (!extract) return `No definition for "${word}"`
  const cleaned = extract
    .replace(/\n==+\s*English\s*==+\n/, "")
    .replace(/====[^=]*====/g, "")
    .replace(/==[^=]*==/g, "")
    .split("\n")
    .filter((l: string) => l.trim())
    .slice(0, 25)
  return `# ${word}\n\n${cleaned.join("\n")}`
}
