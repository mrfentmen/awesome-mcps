/**
 * AlphaFold Protein Structure Database API client, keyless.
 * Docs: https://alphafold.ebi.ac.uk/api-docs
 * Find accessions with uniprot-mcp, then fetch predictions here.
 */
const BASE = "https://alphafold.ebi.ac.uk/api/prediction"

export class AlphaFoldError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "alphafold-mcp/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 404) throw new AlphaFoldError("No AlphaFold prediction for this accession.")
  if (!res.ok) throw new AlphaFoldError(`AlphaFold error ${res.status}`)
  return (await res.json()) as T
}

export interface Prediction {
  accession: string
  modelId?: string
  tool?: string
  plddt?: number
  lowConf?: number
  veryLowConf?: number
  created?: string
  sequenceDate?: string
}

export async function getPrediction(accession: string): Promise<Prediction[]> {
  const clean = accession.trim().toUpperCase()
  if (!/^[A-Z0-9]{6,10}$/.test(clean)) {
    throw new AlphaFoldError(`Not a UniProt accession: "${accession}". Find one with uniprot-mcp first.`)
  }
  const rows = await getJson<Raw[]>(`/${clean}`)
  return rows.slice(0, 5).map((r) => ({
    accession: clean,
    modelId: r.modelEntityId,
    tool: r.toolUsed ? String(r.toolUsed).split(" pipeline")[0] : undefined,
    plddt: typeof r.globalMetricValue === "number" ? r.globalMetricValue : undefined,
    lowConf: typeof r.fractionPlddtLow === "number" ? r.fractionPlddtLow : undefined,
    veryLowConf: typeof r.fractionPlddtVeryLow === "number" ? r.fractionPlddtVeryLow : undefined,
    created: r.modelCreatedDate ? String(r.modelCreatedDate).slice(0, 10) : undefined,
    sequenceDate: r.sequenceVersionDate ? String(r.sequenceVersionDate).slice(0, 10) : undefined,
  }))
}

export function modelFiles(accession: string, version = "v6"): { cif: string; pdb: string; pae: string; page: string } {
  const clean = accession.trim().toUpperCase()
  const base = `https://alphafold.ebi.ac.uk/files/AF-${clean}-F1-model_${version}`
  return {
    cif: `${base}.cif`,
    pdb: `${base}.pdb`,
    pae: `${base}-predicted_aligned_error_v6.json`,
    page: `https://alphafold.ebi.ac.uk/entry/${clean}`,
  }
}

export function formatPrediction(p: Prediction): string {
  const lines = [
    `${p.accession}${p.modelId ? ` (${p.modelId})` : ""}`,
    p.tool ? `Pipeline: ${p.tool}` : "",
    p.plddt !== undefined ? `Mean pLDDT: ${p.plddt} (higher = more confident)` : "",
    p.lowConf !== undefined || p.veryLowConf !== undefined
      ? `Low-confidence fraction: ${p.lowConf ?? 0}% / very low: ${p.veryLowConf ?? 0}%`
      : "",
    p.created ? `Model date: ${p.created}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}
