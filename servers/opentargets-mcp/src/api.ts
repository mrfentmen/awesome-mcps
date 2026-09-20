/**
 * Open Targets Platform GraphQL client, keyless.
 * Docs: https://platform-docs.opentargets.org/data-access/graphql-api
 */
const API = "https://api.platform.opentargets.org/api/v4/graphql"

export class OpenTargetsError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function gql<T>(query: string, variables: Raw = {}): Promise<T> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "User-Agent": "opentargets-mcp/1.0", "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new OpenTargetsError(`Open Targets error ${res.status}`)
  const data = (await res.json()) as Raw
  if (data.errors) throw new OpenTargetsError(`Open Targets: ${String(data.errors[0]?.message ?? "query failed")}`)
  return data.data as T
}

export interface SearchHit {
  id: string
  kind: string
  label: string
}

export async function searchEntities(query: string, entity: "target" | "disease" | "drug", limit = 5): Promise<SearchHit[]> {
  const data = await gql<Raw>(
    `query($q: String!, $e: [String!], $n: Int!) {
      search(queryString: $q, entityNames: $e, page: { index: 0, size: $n }) {
        hits { id object { __typename ... on Target { approvedSymbol approvedName } ... on Disease { name } ... on Drug { name } } }
      }
    }`,
    { q: query, e: [entity], n: Math.min(Math.max(limit, 1), 25) }
  )
  const hits: Raw[] = data.search?.hits ?? []
  return hits.map((h) => {
    const o: Raw = h.object ?? {}
    return {
      id: String(h.id),
      kind: String(o.__typename ?? entity),
      label: String(o.approvedSymbol ?? o.approvedName ?? o.name ?? h.id),
    }
  })
}

export interface TargetDetails {
  id: string
  symbol?: string
  name?: string
  biotype?: string
  functions: string[]
  drugs: string[]
  diseases: string[]
}

export async function getTarget(ensemblId: string): Promise<TargetDetails | null> {
  const id = ensemblId.trim()
  if (!/^ENSG\d+$/.test(id)) throw new OpenTargetsError(`Not an Ensembl gene id: "${ensemblId}". Use search (e.g. BRCA1 gives ENSG...).`)
  const data = await gql<Raw>(
    `query($id: String!) {
      target(ensemblId: $id) {
        approvedSymbol approvedName biotype
        functionDescriptions
        drugAndClinicalCandidates { count rows { drug { name } } }
        associatedDiseases(page: { index: 0, size: 5 }) { rows { disease { name } score } }
      }
    }`,
    { id }
  )
  const t: Raw | null = data.target
  if (!t) return null
  const dc: Raw = t.drugAndClinicalCandidates ?? {}
  return {
    id,
    symbol: t.approvedSymbol,
    name: t.approvedName,
    biotype: t.biotype,
    functions: Array.isArray(t.functionDescriptions) ? t.functionDescriptions.map(String).slice(0, 3) : [],
    drugs: ((dc.rows ?? []) as Raw[]).map((r) => String(r.drug?.name ?? "?")).slice(0, 5),
    diseases: ((t.associatedDiseases?.rows ?? []) as Raw[]).map((r) => `${String(r.disease?.name ?? "?")} (${Number(r.score ?? 0).toFixed(2)})`).slice(0, 5),
  }
}

export function formatHit(h: SearchHit, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}[${h.id}] ${h.label} (${h.kind})`
}

export function formatTarget(t: TargetDetails): string {
  const lines = [
    `${t.symbol ?? t.id}${t.name ? ` — ${t.name}` : ""} [${t.id}]`,
    t.biotype ? `Biotype: ${t.biotype}` : "",
    t.functions.length ? `Functions:\n- ${t.functions.join("\n- ")}` : "",
    t.drugs.length ? `Known drugs: ${t.drugs.join(", ")}` : "",
    t.diseases.length ? `Top diseases:\n- ${t.diseases.join("\n- ")}` : "",
    `More: https://platform.opentargets.org/target/${t.id}`,
  ].filter(Boolean)
  return lines.join("\n")
}
