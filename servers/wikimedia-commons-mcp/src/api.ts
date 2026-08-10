const BASE = "https://commons.wikimedia.org/w/api.php"
const UA = "mrfentmen-wikimedia-commons-mcp/1.0 (https://github.com/mrfentmen)"
export class CommonsError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new CommonsError(`Wikimedia Commons returned HTTP ${res.status}`)
  return (await res.json()) as T
}

function pagesFrom(d: any): any[] {
  const pages = d?.query?.pages ?? {}
  return Object.values(pages) as any[]
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new CommonsError("Provide a search query")
  const limit = Math.min(args.limit ?? 8, 20)
  const d = await get<any>(
    `${BASE}?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}&gsrlimit=${limit}&prop=imageinfo&iiprop=url|size|mime&format=json&origin=*`
  )
  const pages = pagesFrom(d)
  if (!pages.length) return `No Commons files found for \"${q}\"`
  return `Commons files for \"${q}\":\n` + pages.map((p: any, i: number) => {
    const info = p?.imageinfo?.[0] ?? {}
    const size = info?.width && info?.height ? `${info.width}x${info.height}` : ""
    const bytes = info?.size != null ? `${(info.size / 1024).toFixed(0)} KB` : ""
    return `${i + 1}. ${p?.title ?? "n/a"}\n   ${info?.url ?? ""} ${size ? `| ${size}` : ""} ${bytes ? `| ${bytes}` : ""}`
  }).join("\n")
}

export async function file(args: { title?: string }): Promise<string> {
  const title = (args.title ?? "").trim()
  if (!title) throw new CommonsError("Provide a file title like File:Example.jpg")
  const d = await get<any>(
    `${BASE}?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json&origin=*`
  )
  const p = pagesFrom(d)[0]
  const info = p?.imageinfo?.[0]
  if (!info) throw new CommonsError(`File not found: ${title}`)
  const meta = info?.extmetadata ?? {}
  const artist = (meta?.Artist?.value ?? "").replace(/<[^>]+>/g, "").slice(0, 120)
  const license = (meta?.LicenseShortName?.value ?? "").replace(/<[^>]+>/g, "")
  const lines = [
    `Title: ${p?.title ?? title}`,
    `URL: ${info?.url ?? ""}`,
    `Size: ${info?.width ?? "?"}x${info?.height ?? "?"} | ${info?.mime ?? ""} | ${info?.size != null ? `${(info.size / 1024 / 1024).toFixed(1)} MB` : ""}`,
  ]
  if (artist) lines.push(`Artist: ${artist}`)
  if (license) lines.push(`License: ${license}`)
  return lines.join("\n")
}
