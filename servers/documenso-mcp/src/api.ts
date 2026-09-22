/**
 * Documenso API v2 client. Points at any instance via DOCUMENSO_URL
 * (default https://app.documenso.com). Needs DOCUMENSO_API_KEY.
 * Docs: https://docs.documenso.com/developers/api
 */
const BASE = (process.env.DOCUMENSO_URL ?? "https://app.documenso.com").replace(/\/+$/, "")

export class DocumensoError extends Error {}

function headers(): Record<string, string> {
  const key = process.env.DOCUMENSO_API_KEY
  if (!key) throw new DocumensoError("Set DOCUMENSO_API_KEY first.")
  return { "User-Agent": "documenso-mcp/1.0", Accept: "application/json", Authorization: `Bearer ${key}` }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: headers(),
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 401 || res.status === 403) throw new DocumensoError("Documenso refused (401/403). Check URL and key.")
  if (res.status === 404) throw new DocumensoError("Not found.")
  if (!res.ok) throw new DocumensoError(`Documenso error ${res.status}`)
  return (await res.json()) as T
}

export interface Document {
  id: string
  title?: string
  status?: string
  created?: string
}

export async function listDocuments(limit = 10): Promise<Document[]> {
  const data = await getJson<Raw>(`/api/v2/documents?perPage=${Math.min(Math.max(limit, 1), 100)}`)
  const rows: Raw[] = Array.isArray(data.documents) ? data.documents : []
  return rows.slice(0, limit).map((d) => ({
    id: String(d.id),
    title: d.title,
    status: d.status,
    created: d.createdAt ? String(d.createdAt).slice(0, 10) : undefined,
  }))
}

export interface DocumentDetails extends Document {
  recipients: string[]
}

export async function getDocument(id: string): Promise<DocumentDetails> {
  if (!id.trim()) throw new DocumensoError("Document id is empty.")
  const d = await getJson<Raw>(`/api/v2/documents/${encodeURIComponent(id.trim())}`)
  const doc: Raw = d.document ?? d
  const recips: Raw[] = Array.isArray(doc.recipients) ? doc.recipients : []
  return {
    id: String(doc.id ?? id),
    title: doc.title,
    status: doc.status,
    created: doc.createdAt ? String(doc.createdAt).slice(0, 10) : undefined,
    recipients: recips.map((r) => `${String(r.email ?? "?")}${r.signingStatus ? ` [${r.signingStatus}]` : ""}`),
  }
}

export function formatDocument(d: DocumentDetails | Document, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  const lines = [
    `${prefix}[${d.id}] ${d.title ?? "(untitled)"}${d.status ? ` [${d.status}]` : ""}${d.created ? ` (${d.created})` : ""}`,
  ]
  if ("recipients" in d && (d as DocumentDetails).recipients.length) {
    lines.push(`Recipients:\n- ${(d as DocumentDetails).recipients.join("\n- ")}`)
  }
  return lines.join("\n")
}
