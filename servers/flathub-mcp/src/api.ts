const BASE = "https://flathub.org/api/v2"
const UA = "mrfentmen-flathub-mcp/1.0 (https://github.com/mrfentmen)"
export class FlathubError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new FlathubError(`Flathub returned HTTP ${res.status}`)
  return (await res.json()) as T
}

async function appDetail(id: string): Promise<any> {
  try {
    return await get<any>(`${BASE}/appstream/${encodeURIComponent(id)}`)
  } catch {
    return null
  }
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim().toLowerCase()
  if (!q) throw new FlathubError("Provide a search query")
  const limit = Math.min(args.limit ?? 8, 10)
  const ids = await get<string[]>(`${BASE}/appstream`)
  const matches = (ids ?? []).filter((id) => id.toLowerCase().includes(q)).slice(0, limit)
  if (!matches.length) return `No apps found for \"${q}\"`
  const rows: string[] = []
  for (const id of matches) {
    const a = await appDetail(id)
    if (!a?.id) {
      rows.push(`${id}: (detail unavailable)`)
      continue
    }
    const ver = a?.current_release_version
    rows.push(`${id} | ${a?.name ?? "n/a"}${ver ? ` | v${ver}` : ""}\n   ${(a?.summary ?? "no summary").slice(0, 130)} | ${a?.developer_name ?? ""}`)
  }
  return `Flathub apps matching \"${q}\":\n` + rows.join("\n")
}

export async function app(args: { appId?: string }): Promise<string> {
  const id = (args.appId ?? "").trim()
  if (!id) throw new FlathubError("Provide an app ID like org.gimp.GIMP")
  const a = await appDetail(id)
  if (!a?.id) throw new FlathubError(`App not found: ${id}`)
  const lines = [
    `${a?.name ?? "n/a"} (${a?.id ?? id})`,
    `Summary: ${a?.summary ?? "n/a"}`,
    `Developer: ${a?.developer_name ?? "n/a"}`,
    `Version: ${a?.current_release_version ?? "n/a"}`,
    `\n${(a?.description ?? "no description").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 600)}`,
  ]
  if (a?.urls?.homepage) lines.push(`\nHomepage: ${a.urls.homepage}`)
  return lines.join("\n")
}
