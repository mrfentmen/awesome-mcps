
export interface m0_ArchiveItem {
  identifier: string
  title?: string
  mediatype?: string
  year?: string
  downloads?: number
  collection?: string[]
  description?: string
}

export interface m0_ArchiveFile {
  name: string
  size?: number
  format?: string
  length?: string
  title?: string
}

export interface m1_Snapshot {
  timestamp: string
  original: string
  statusCode: string
  mimeType: string
  length: string
  url: string
}

const m0 = (() => {
/**
 * Internet Archive client — keyless.
 *  - advancedsearch.php: full-text + metadata search over ~200M items.
 *  - metadata/{identifier}: file manifests for an item.
 */
const SEARCH = "https://archive.org/advancedsearch.php"
const META = "https://archive.org/metadata"

class ArchiveError extends Error {}



async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": "archive-org-mcp/1.0" } })
  if (!res.ok) throw new ArchiveError(`Internet Archive error ${res.status} for ${url.slice(0, 120)}`)
  return (await res.json()) as T
}

async function searchItems(
  query: string,
  mediatype: string | undefined,
  limit = 8
): Promise<m0_ArchiveItem[]> {
  const q = mediatype ? `(${query}) AND mediatype:${mediatype}` : query
  const fl = ["identifier", "title", "mediatype", "year", "downloads", "collection", "description"].join(",")
  const url = `${SEARCH}?q=${encodeURIComponent(q)}&fl[]=${fl}&rows=${limit}&page=1&output=json`
  const data = await getJson<{ response?: { docs?: any[] } }>(url)
  return (data.response?.docs ?? []).map((d) => ({
    identifier: d.identifier ?? "",
    title: d.title ?? d.identifier,
    mediatype: d.mediatype,
    year: d.year,
    downloads: d.downloads,
    collection: d.collection,
    description: d.description,
  }))
}

async function getItemDetails(identifier: string): Promise<{
  identifier: string
  title?: string
  mediatype?: string
  description?: string
  files: m0_ArchiveFile[]
}> {
  const data = await getJson<any>(`${META}/${encodeURIComponent(identifier)}`)
  const files: m0_ArchiveFile[] = (data.files ?? [])
    .filter((f: any) => f.name && !f.name.endsWith("_files.xml") && !f.name.endsWith("_meta.xml"))
    .map((f: any) => ({
      name: f.name ?? "",
      size: f.size,
      format: f.format,
      length: f.length,
      title: f.title,
    }))
    .slice(0, 30)
  return {
    identifier: data.metadata?.identifier ?? identifier,
    title: data.metadata?.title ?? data.metadata?.identifier,
    mediatype: data.metadata?.mediatype,
    description: data.metadata?.description,
    files,
  }
}

function fmtSize(bytes?: number): string {
  if (!bytes) return ""
  const units = ["B", "KB", "MB", "GB", "TB"]
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(1)} ${units[i]}`
}

function formatItem(it: m0_ArchiveItem, index: number): string {
  const meta = [
    it.mediatype,
    it.year,
    it.downloads ? `${it.downloads.toLocaleString()} downloads` : "",
  ]
    .filter(Boolean)
    .join(" · ")
  const lines = [
    `${index + 1}. ${it.title ?? it.identifier} [${it.identifier}]`,
    meta,
    `https://archive.org/details/${it.identifier}`,
  ].filter(Boolean)
  return lines.join("\n")
}

return { ArchiveError, fmtSize, formatItem, getItemDetails, searchItems };
})();

const m1 = (() => {
/**
 * Wayback Machine client. Keyless.
 *  - CDX API lists snapshot history for a URL.
 *  - /wayback/available finds the nearest snapshot.
 *  - /web/{timestamp}id_/{url} serves the archived page content.
 */
const CDX = "https://web.archive.org/cdx/search/cdx"
const AVAILABLE = "https://archive.org/wayback/available"

class WaybackError extends Error {}


async function getText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "wayback-mcp/1.0", Accept: "application/json,text/plain,text/html" },
  })
  if (!res.ok) throw new WaybackError(`Wayback error ${res.status} for ${url.slice(0, 100)}`)
  return res.text()
}

async function getSnapshots(url: string, limit = 10): Promise<m1_Snapshot[]> {
  const q = `${CDX}?url=${encodeURIComponent(url)}&output=json&fl=timestamp,original,statuscode,mimetype,length&filter=statuscode:200&limit=${limit}`
  const text = await getText(q)
  const rows: string[][] = JSON.parse(text)
  if (rows.length <= 1) return []
  const [, ...data] = rows
  return data.map((r) => ({
    timestamp: r[0] ?? "",
    original: r[1] ?? url,
    statusCode: r[2] ?? "",
    mimeType: r[3] ?? "",
    length: r[4] ?? "",
    url: `https://web.archive.org/web/${r[0]}id_/${r[1] ?? url}`,
  }))
}

async function getAvailability(url: string): Promise<m1_Snapshot | null> {
  const text = await getText(`${AVAILABLE}?url=${encodeURIComponent(url)}`)
  const d = JSON.parse(text) as { archived_snapshots?: { closest?: { url?: string; timestamp?: string; status?: string } } }
  const closest = d.archived_snapshots?.closest
  if (!closest?.url) return null
  return {
    timestamp: closest.timestamp ?? "",
    original: url,
    statusCode: closest.status ?? "",
    mimeType: "",
    length: "",
    url: closest.url,
  }
}

async function getSnapshotText(
  timestamp: string,
  originalUrl: string,
  maxChars = 15000
): Promise<string> {
  const target = `https://web.archive.org/web/${timestamp}id_/${originalUrl}`
  const raw = await getText(target)
  const plain = raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
  return plain.slice(0, maxChars)
}

function fmtTimestamp(ts: string): string {
  if (ts.length < 12) return ts
  return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)} ${ts.slice(8, 10)}:${ts.slice(10, 12)} UTC`
}

function formatSnapshot(s: m1_Snapshot, index?: number): string {
  const head = `${index !== undefined ? `${index + 1}. ` : ""}${fmtTimestamp(s.timestamp)}`
  const lines = [
    head,
    `Status ${s.statusCode || "?"}${s.mimeType ? ` · ${s.mimeType}` : ""}${s.length ? ` · ${s.length} bytes` : ""}`,
    s.url,
  ].filter(Boolean)
  return lines.join("\n")
}

return { WaybackError, fmtTimestamp, formatSnapshot, getAvailability, getSnapshotText, getSnapshots };
})();

export const ArchiveError = m0.ArchiveError;
export const WaybackError = m1.WaybackError;
export const fmtSize = m0.fmtSize;
export const fmtTimestamp = m1.fmtTimestamp;
export const formatItem = m0.formatItem;
export const formatSnapshot = m1.formatSnapshot;
export const getAvailability = m1.getAvailability;
export const getItemDetails = m0.getItemDetails;
export const getSnapshotText = m1.getSnapshotText;
export const getSnapshots = m1.getSnapshots;
export const searchItems = m0.searchItems;
export const m0_fmtSize = m0.fmtSize;
export const m0_ArchiveError = m0.ArchiveError;
export const m0_getItemDetails = m0.getItemDetails;
export const m0_formatItem = m0.formatItem;
export const m0_searchItems = m0.searchItems;
export const m1_fmtTimestamp = m1.fmtTimestamp;
export const m1_formatSnapshot = m1.formatSnapshot;
export const m1_getAvailability = m1.getAvailability;
export const m1_WaybackError = m1.WaybackError;
export const m1_getSnapshotText = m1.getSnapshotText;
export const m1_getSnapshots = m1.getSnapshots;
