const BASE = "https://rest.uniprot.org"
const UA = "mrfentmen-uniprot-mcp/1.0 (https://github.com/mrfentmen)"
export class UniprotError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new UniprotError(`UniProt returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function accession(args: { accession?: string }): Promise<string> {
  const acc = (args.accession ?? "").trim().toUpperCase()
  if (!acc) throw new UniprotError("Provide an accession like P12345")
  const d = await get<any>(`${BASE}/uniprotkb/${encodeURIComponent(acc)}.json`)
  const lines = [
    `Accession: ${d?.primaryAccession ?? acc}`,
    `Name: ${d?.proteinDescription?.recommendedName?.fullName?.value ?? d?.proteinDescription?.submissionNames?.[0]?.fullName?.value ?? "n/a"}`,
    `Organism: ${d?.organism?.scientificName ?? "n/a"}`,
    `Gene: ${d?.genes?.[0]?.geneName?.value ?? "n/a"}`,
    `Length: ${d?.sequence?.length ?? "n/a"} amino acids`,
    `Reviewed: ${d?.entryType ?? "n/a"}`,
  ]
  const func = d?.comments?.find((c: any) => c?.commentType === "FUNCTION")?.text?.[0]?.value
  if (func) lines.push(`\nFunction: ${func.slice(0, 500)}`)
  if (d?.sequence?.value) {
    const seq = d.sequence.value
    lines.push(`\nSequence (first 80): ${seq.slice(0, 80)}${seq.length > 80 ? "..." : ""}`)
  }
  return lines.join("\n")
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new UniprotError("Provide a search query")
  const limit = Math.min(args.limit ?? 10, 25)
  const d = await get<any>(`${BASE}/uniprotkb/search?query=${encodeURIComponent(q)}&size=${limit}&format=json`)
  const results = (d?.results ?? []) as any[]
  if (!results.length) return `No proteins found for \"${q}\"`
  return `UniProt results for \"${q}\" (${d?.results?.length ?? results.length} shown):\n` + results.map((r: any, i: number) => {
    const name = r?.proteinDescription?.recommendedName?.fullName?.value ?? r?.proteinDescription?.submissionNames?.[0]?.fullName?.value ?? "n/a"
    return `${i + 1}. ${r?.primaryAccession ?? "n/a"} | ${name} | ${r?.organism?.scientificName ?? "n/a"}`
  }).join("\n")
}
