const BASE = "https://repo.packagist.org"
const UA = "mrfentmen-packagist-mcp/1.0 (https://github.com/mrfentmen)"
export class PackagistError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new PackagistError("Packagist rate limit hit, wait and retry")
  if (!res.ok) throw new PackagistError(`Packagist error ${res.status}`)
  return (await res.json()) as T
}

export async function packageInfo(args: { name?: string }): Promise<string> {
  const name = (args.name ?? "").trim().toLowerCase()
  if (!name) throw new PackagistError("Provide a package name like vendor/package")
  if (!name.includes("/")) throw new PackagistError("Package names look like vendor/package")
  const d = await get<any>(`${BASE}/p2/${encodeURIComponent(name)}.json`)
  const pkg = d?.packages?.[name]?.[0]
  if (!pkg) throw new PackagistError("Package not found")
  const desc = pkg?.description ?? "n/a"
  const versions = (d?.packages?.[name] ?? []).length
  return `Package: ${name}\nDescription: ${desc}\nLatest version: ${pkg.version ?? "n/a"}\nVersions listed: ${versions}\nLicense: ${Array.isArray(pkg.license) ? pkg.license.join(", ") : (pkg.license ?? "n/a")}\nHomepage: ${pkg.homepage ?? pkg.source?.url ?? "n/a"}\nRequires php: ${pkg.require?.php ?? "any"}`
}

export async function searchPackages(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? "").trim()
  if (!q) throw new PackagistError("Provide search terms")
  const limit = Math.min(args.limit ?? 10, 30)
  const d = await get<any>(`https://packagist.org/search.json?q=${encodeURIComponent(q)}`)
  const results = d?.results ?? []
  if (!results.length) return "No packages found"
  return results.slice(0, limit).map((r: any, i: number) => `${i + 1}. ${r.name} ${r.description ? `\n   ${r.description.slice(0, 120)}` : ""}`).join("\n")
}
