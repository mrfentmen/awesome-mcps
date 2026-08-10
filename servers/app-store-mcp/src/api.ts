const UA = "mrfentmen-app-store-mcp/1.0 (https://github.com/mrfentmen)"
export class AppStoreError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new AppStoreError("App Store feed rate limit hit, wait and retry")
  if (!res.ok) throw new AppStoreError(`App Store feed error ${res.status}`)
  return (await res.json()) as T
}

function fmtEntry(e: any, i: number): string {
  return `${i + 1}. ${e?.["im:name"]?.label ?? "Untitled"}\n   ${e?.["im:artist"]?.label ?? "n/a"} | rating ${e?.["im:rating"]?.label ?? "n/a"} | id ${e?.id?.attributes?.["im:id"] ?? "?"}`
}

export async function topFree(args: { country?: string; limit?: number }): Promise<string> {
  const country = (args.country ?? "us").toLowerCase()
  const limit = Math.min(args.limit ?? 10, 50)
  const d = await get<any>(`https://itunes.apple.com/${country}/rss/topfreeapplications/limit=${limit}/json`)
  const entries = d?.feed?.entry ?? []
  if (!entries.length) return "No apps returned"
  return `Top free apps (${country}):\n\n${entries.map(fmtEntry).join("\n")}`
}

export async function topPaid(args: { country?: string; limit?: number }): Promise<string> {
  const country = (args.country ?? "us").toLowerCase()
  const limit = Math.min(args.limit ?? 10, 50)
  const d = await get<any>(`https://itunes.apple.com/${country}/rss/toppaidapplications/limit=${limit}/json`)
  const entries = d?.feed?.entry ?? []
  if (!entries.length) return "No apps returned"
  return `Top paid apps (${country}):\n\n${entries.map(fmtEntry).join("\n")}`
}

export async function appLookup(args: { appId?: number }): Promise<string> {
  const id = args.appId
  if (id === undefined || id <= 0) throw new AppStoreError("Provide an App Store numeric ID")
  const d = await get<any>(`https://itunes.apple.com/lookup?id=${id}`)
  const r = d?.results?.[0]
  if (!r) return "App not found"
  return `Name: ${r.trackName ?? "n/a"}\nDeveloper: ${r.artistName ?? "n/a"}\nCategory: ${r.primaryGenreName ?? "n/a"} | Rating: ${r.averageUserRating ?? "n/a"} (${r.userRatingCount ?? 0} ratings)\nPrice: ${r.formattedPrice ?? "n/a"}\nSize: ${r.fileSizeBytes ? (Number(r.fileSizeBytes) / 1e6).toFixed(1) + " MB" : "n/a"}\nURL: ${r.trackViewUrl ?? "n/a"}`
}
