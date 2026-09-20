/**
 * Cover Art Archive client, keyless.
 * Look up artwork for a MusicBrainz release or release-group MBID.
 * Docs: https://musicbrainz.org/doc/Cover_Art_Archive/API
 */
const BASE = "https://coverartarchive.org"

export class CoverArtError extends Error {}

const MBID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

export interface CoverInfo {
  mbid: string
  kind: string
  front?: string
  frontThumb?: string
  back?: string
  imageCount: number
  allImages: string[]
}

async function fetchJson(url: string): Promise<Raw> {
  const res = await fetch(url, {
    headers: { "User-Agent": "coverartarchive-mcp/1.0", Accept: "application/json" },
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  })
  if (res.status === 404) throw new CoverArtError("No cover art archived for this MBID yet.")
  if (!res.ok) throw new CoverArtError(`Cover Art Archive error ${res.status}`)
  return (await res.json()) as Raw
}

export async function getCover(mbid: string, kind: "release" | "release-group"): Promise<CoverInfo> {
  const clean = mbid.trim().toLowerCase()
  if (!MBID.test(clean)) throw new CoverArtError(`Not a valid MBID: "${mbid}". Find one with musicbrainz-mcp first.`)
  const data = await fetchJson(`${BASE}/${kind}/${clean}/`)
  const images: Raw[] = Array.isArray(data.images) ? data.images : []
  const front = images.find((i) => i.front === true)
  const back = images.find((i) => i.back === true)
  return {
    mbid: clean,
    kind,
    front: front?.image,
    frontThumb: front?.thumbnails?.["500"] ?? front?.thumbnails?.small,
    back: back?.image,
    imageCount: images.length,
    allImages: images.map((i) => String(i.image)).slice(0, 10),
  }
}

export function frontUrl(mbid: string, kind: "release" | "release-group", size: 250 | 500 | 1200 = 500): string {
  return `${BASE}/${kind}/${mbid.trim().toLowerCase()}/front-${size}`
}

export function formatCover(c: CoverInfo): string {
  const lines = [
    `Cover art for ${c.kind} ${c.mbid} (${c.imageCount} image${c.imageCount === 1 ? "" : "s"} archived)`,
    c.front ? `Front: ${c.front}` : "No front cover archived.",
    c.frontThumb ? `Front thumbnail: ${c.frontThumb}` : "",
    c.back ? `Back: ${c.back}` : "",
    c.allImages.length > 1 ? `All images:\n- ${c.allImages.join("\n- ")}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}
