const UA = "mrfentmen-hn-reddit-mcp/1.0 (https://github.com/mrfentmen)"
export class SocialError extends Error {}

async function get<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, ...headers }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new SocialError(`API error ${res.status}`)
  return (await res.json()) as T
}

export async function hnTop(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 15, 30)
  const ids = await get<number[]>("https://hacker-news.firebaseio.com/v0/topstories.json")
  const items = await Promise.all(ids.slice(0, limit).map((id) => get<any>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)))
  return items.map((it, i) =>
    `${i + 1}. ${it.title ?? ""} (${it.score ?? 0} pts)\n   ${it.url ?? `https://news.ycombinator.com/item?id=${it.id}`}`
  ).join("\n\n")
}

export async function hnItem(args: { item_id?: number }): Promise<string> {
  const id = args.item_id ?? 0
  if (!id) throw new SocialError("Provide an item id")
  const it = await get<any>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
  return `${it.title ?? "item"} (${it.score ?? 0} pts, ${it.descendants ?? 0} comments)\n${it.url ?? `https://news.ycombinator.com/item?id=${it.id}`}\n\n${(it.text ?? "").slice(0, 2000)}`
}

function parseRss(xml: string): Array<{ title: string; link: string; author: string }> {
  const out: Array<{ title: string; link: string; author: string }> = []
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g
  let m: RegExpExecArray | null
  while ((m = entryRe.exec(xml)) !== null) {
    const e = m[1]
    const title = /<title>([\s\S]*?)<\/title>/.exec(e)?.[1] ?? ""
    const link = /<link[^>]*href="([^"]+)"/.exec(e)?.[1] ?? ""
    const author = /<name>([\s\S]*?)<\/name>/.exec(e)?.[1] ?? ""
    if (title) out.push({ title, link, author })
  }
  return out
}

export async function redditTop(args: { subreddit?: string; limit?: number }): Promise<string> {
  const sub = encodeURIComponent(args.subreddit ?? "programming")
  const limit = Math.min(args.limit ?? 10, 25)
  const res = await fetch(`https://www.reddit.com/r/${sub}/top/.rss?t=week`, {
    headers: { "User-Agent": UA, Accept: "application/atom+xml" },
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new SocialError(`Reddit error ${res.status}`)
  const posts = parseRss(await res.text()).slice(0, limit)
  return posts.map((p, i) =>
    `${i + 1}. ${p.title}\n   u/${p.author || "unknown"} | r/${sub}\n   ${p.link}`
  ).join("\n\n") || "No posts found"
}
