const BASE = "https://pubchem.ncbi.nlm.nih.gov/rest"
const UA = "mrfentmen-pubchem-mcp/1.0 (https://github.com/mrfentmen)"
export class PubchemError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new PubchemError(`PubChem returned HTTP ${res.status} ${detail.slice(0, 80)}`)
  }
  return (await res.json()) as T
}

export async function compound(args: { name?: string }): Promise<string> {
  const name = (args.name ?? "").trim()
  if (!name) throw new PubchemError("Provide a compound name")
  const d = await get<any>(
    `${BASE}/pug/compound/name/${encodeURIComponent(name)}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES,InChIKey/JSON`
  )
  const p = d?.PropertyTable?.Properties?.[0]
  if (!p) throw new PubchemError(`Compound not found: ${name}`)
  const lines = [
    `Name: ${p.IUPACName ?? name}`,
    `CID: ${p.CID ?? "n/a"}`,
    `Formula: ${p.MolecularFormula ?? "n/a"}`,
    `Molecular weight: ${p.MolecularWeight != null ? p.MolecularWeight : "n/a"}`,
    `SMILES: ${p.CanonicalSMILES ?? "n/a"}`,
    `InChIKey: ${p.InChIKey ?? "n/a"}`,
  ]
  return lines.join("\n")
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new PubchemError("Provide a search query")
  const limit = Math.min(args.limit ?? 10, 25)
  const d = await get<any>(`${BASE}/autocomplete/compound/${encodeURIComponent(q)}/json?limit=${limit}`)
  const terms = (d?.dictionary_terms?.compound ?? []) as string[]
  if (!terms.length) return "No matching compounds found"
  return terms.map((t, i) => `${i + 1}. ${t}`).join("\n")
}
