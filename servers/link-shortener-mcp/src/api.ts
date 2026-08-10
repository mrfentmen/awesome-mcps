const BASE = "https://is.gd"
const UA = "mrfentmen-link-shortener-mcp/1.0 (https://github.com/mrfentmen)"
export class LinkError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (res.status === 429) throw new LinkError("is.gd rate limit hit, wait and retry")
  if (!res.ok) throw new LinkError(`is.gd error ${res.status}`)
  return (await res.json()) as T
}

export async function shorten(args: { url?: string }): Promise<string> {
  const url = (args.url ?? "").trim()
  if (!/^https?:\/\/.+/i.test(url)) throw new LinkError("Provide a full URL starting with http or https")
  if (url.length > 2000) throw new LinkError("URL is too long")
  const d = await get<any>(`${BASE}/create.php?format=json&url=${encodeURIComponent(url)}`)
  if (d?.errorcode) throw new LinkError(`is.gd: ${d.errormessage ?? "shorten failed"}`)
  return `Shortened:\n${d?.shorturl ?? ""}\n\nOriginal:\n${url}`
}

export async function expand(args: { url?: string }): Promise<string> {
  const url = (args.url ?? "").trim()
  if (!/^https?:\/\/.+/i.test(url)) throw new LinkError("Provide a URL to expand")
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "manual", signal: AbortSignal.timeout(20000) })
  if (!res.ok && res.status !== 301 && res.status !== 302) throw new LinkError(`Expand error ${res.status}`)
  const loc = res.headers.get("location")
  return loc ? `${url} ->\n${loc}` : "No redirect found for this URL"
}
