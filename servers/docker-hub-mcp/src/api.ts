const BASE = "https://hub.docker.com/v2"
const UA = "mrfentmen-docker-hub-mcp/1.0 (https://github.com/mrfentmen)"
export class DockerError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new DockerError("Docker Hub rate limit hit, wait and retry")
  if (!res.ok) throw new DockerError(`Docker Hub error ${res.status}`)
  return (await res.json()) as T
}

export async function imageInfo(args: { name?: string }): Promise<string> {
  const name = (args.name ?? "").trim()
  if (!name) throw new DockerError("Provide an image name like library/nginx")
  const d = await get<any>(`${BASE}/repositories/${name.split("/").map(encodeURIComponent).join("/")}`)
  return `Image: ${d?.name ?? name}\nDescription: ${d?.description ?? "n/a"}\nPull count: ${(d?.pull_count ?? 0).toLocaleString()}\nStars: ${d?.star_count ?? 0}\nLast updated: ${d?.last_updated ? new Date(d.last_updated).toISOString().slice(0, 10) : "n/a"}\nTags: ${(d?.tags?.length ?? 0)}`
}

export async function searchImages(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new DockerError("Provide search terms")
  const limit = Math.min(args.limit ?? 10, 30)
  const d = await get<any>(`${BASE}/search/repositories?query=${encodeURIComponent(q)}&page_size=${limit}`)
  const results = d?.results ?? []
  if (!results.length) return "No images found"
  return results.map((r: any, i: number) => {
    const pulls = (r?.pull_count ?? 0)
    const pullsStr = pulls >= 1e9 ? (pulls / 1e9).toFixed(1) + "B" : pulls >= 1e6 ? (pulls / 1e6).toFixed(1) + "M" : pulls >= 1e3 ? (pulls / 1e3).toFixed(1) + "K" : String(pulls)
    return `${i + 1}. ${r?.repo_name ?? "n/a"} | ${pullsStr} pulls | ${r?.star_count ?? 0} stars\n   ${(r?.short_description ?? "").slice(0, 120)}`
  }).join("\n\n")
}
