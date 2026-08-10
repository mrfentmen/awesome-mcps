const TOKEN = process.env.GITHUB_TOKEN
const BASE = "https://api.github.com"
const UA = "mrfentmen-github-intel-mcp/1.0 (https://github.com/mrfentmen)"
export class GithubError extends Error {}

async function request<T>(path: string): Promise<T> {
  const headers: Record<string, string> = { "User-Agent": UA, Accept: "application/vnd.github+json" }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`
  const res = await fetch(`${BASE}${path}`, { headers, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new GithubError(`GitHub error ${res.status}: ${res.statusText}`)
  return (await res.json()) as T
}

export async function searchRepos(args: { query?: string; limit?: number }): Promise<string> {
  const q = encodeURIComponent(args.query ?? "")
  const limit = Math.min(args.limit ?? 10, 25)
  const d = await request<any>(`/search/repositories?q=${q}&sort=stars&order=desc&per_page=${limit}`)
  const rows = d.items ?? []
  return rows.map((r: any, i: number) =>
    `${i + 1}. ${r.full_name ?? ""} | ${r.stargazers_count ?? 0} stars\n   ${r.language ?? ""} | ${r.description ?? ""}`
  ).join("\n\n") || "No repos found"
}

export async function repo(args: { owner?: string; repo?: string }): Promise<string> {
  const owner = encodeURIComponent(args.owner ?? "")
  const name = encodeURIComponent(args.repo ?? "")
  if (!owner || !name) throw new GithubError("Provide owner and repo")
  const r = await request<any>(`/repos/${owner}/${name}`)
  return [
    `${r.full_name} | ${r.stargazers_count} stars | ${r.forks_count} forks`,
    r.language ?? "",
    r.description ?? "",
    `License: ${r.license?.spdx_id ?? "none"} | Updated ${(r.updated_at ?? "").slice(0, 10)}`,
    r.homepage ?? "",
  ].filter(Boolean).join("\n")
}

export async function userRepos(args: { username?: string; limit?: number }): Promise<string> {
  const user = encodeURIComponent(args.username ?? "")
  if (!user) throw new GithubError("Provide a username")
  const limit = Math.min(args.limit ?? 15, 50)
  const rows = await request<any[]>(`/users/${user}/repos?per_page=${limit}&sort=updated`)
  return rows.map((r: any) =>
    `${r.name ?? ""} | ${r.stargazers_count ?? 0} stars | ${r.language ?? ""}\n  ${r.description ?? ""}`
  ).join("\n\n")
}
