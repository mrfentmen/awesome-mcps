const BASE = "https://www.ebi.ac.uk/chembl/api/data"
const UA = "mrfentmen-chembl-mcp/1.0 (https://github.com/mrfentmen)"
export class ChemblError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new ChemblError(`ChEMBL returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function molecule(args: { id?: string }): Promise<string> {
  const id = (args.id ?? "").trim().toUpperCase()
  if (!/^CHEMBL\d+$/.test(id)) throw new ChemblError("Provide a molecule ID like CHEMBL25")
  const m = await get<any>(`${BASE}/molecule/${encodeURIComponent(id)}.json`)
  const lines = [
    `Molecule: ${m?.pref_name ?? id}`,
    `ChEMBL ID: ${m?.molecule_chembl_id ?? id}`,
    `Formula: ${m?.molecule_properties?.full_molformula ?? "n/a"}`,
    `Molecular weight: ${m?.molecule_properties?.full_mwt != null ? Number(m.molecule_properties.full_mwt).toFixed(2) : "n/a"}`,
    `SMILES: ${m?.molecule_structures?.canonical_smiles ?? "n/a"}`,
  ]
  const indications = (m?.molecule_hierarchy ?? {})
  if (m?.molecule_synonyms?.length) {
    const syns = m.molecule_synonyms.slice(0, 5).map((s: any) => s?.molecule_synonym).filter(Boolean)
    if (syns.length) lines.push(`Synonyms: ${syns.join(", ")}`)
  }
  if (indications?.parent_chembl_id) lines.push(`Parent: ${indications.parent_chembl_id}`)
  return lines.join("\n")
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new ChemblError("Provide a name fragment")
  const limit = Math.min(args.limit ?? 10, 20)
  const d = await get<any>(
    `${BASE}/molecule.json?pref_name__icontains=${encodeURIComponent(q)}&limit=${limit}`
  )
  const mols = (d?.molecules ?? []) as any[]
  if (!mols.length) return `No ChEMBL molecules found for \"${q}\"`
  return `ChEMBL molecules matching \"${q}\" (${d?.page_meta?.total_count ?? mols.length} total):\n` + mols.map((m: any, i: number) => {
    return `${i + 1}. ${m?.pref_name ?? "n/a"} | ${m?.molecule_chembl_id ?? ""} | ${m?.molecule_properties?.full_molformula ?? ""}`
  }).join("\n")
}
