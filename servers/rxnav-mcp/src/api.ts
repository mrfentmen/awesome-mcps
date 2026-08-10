const BASE = "https://rxnav.nlm.nih.gov/REST"
const UA = "mrfentmen-rxnav-mcp/1.0 (https://github.com/mrfentmen)"
export class RxnavError extends Error {}

async function getText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/xml" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new RxnavError(`RxNav returned HTTP ${res.status}`)
  return await res.text()
}

function tagAll(xml: string, tag: string): string[] {
  const out: string[] = []
  const re = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "g")
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) out.push(m[1])
  return out
}

function tagOne(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`))
  return m ? m[1] : null
}

export async function search(args: { term?: string }): Promise<string> {
  const term = (args.term ?? "").trim()
  if (!term) throw new RxnavError("Provide a drug name")
  const xml = await getText(`${BASE}/approximateTerm?term=${encodeURIComponent(term)}`)
  const names = tagAll(xml, "name")
  const ids = tagAll(xml, "rxnormId")
  const scores = tagAll(xml, "score")
  if (!names.length) return `No drugs found for \"${term}\"`
  const lines = names.map((n, i) => `${i + 1}. ${n} | RxCUI ${ids[i] ?? "n/a"} | score ${scores[i] ?? "n/a"}`)
  return `Drug matches for \"${term}\":\n` + lines.slice(0, 12).join("\n")
}

export async function properties(args: { rxcui?: string }): Promise<string> {
  const rxcui = (args.rxcui ?? "").trim()
  if (!/^\d+$/.test(rxcui)) throw new RxnavError("Provide a numeric RxCUI")
  const xml = await getText(`${BASE}/rxcui/${encodeURIComponent(rxcui)}/properties`)
  const name = tagOne(xml, "name")
  const synonym = tagOne(xml, "synonym")
  const tty = tagOne(xml, "tty")
  const lines = [
    `RxCUI: ${rxcui}`,
    `Name: ${name ?? "n/a"}`,
  ]
  if (synonym) lines.push(`Synonym: ${synonym}`)
  if (tty) lines.push(`Type: ${tty}`)
  return lines.join("\n")
}
