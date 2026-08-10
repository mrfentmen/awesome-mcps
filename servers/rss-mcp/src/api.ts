const UA = "mrfentmen-rss-mcp/1.0 (https://github.com/mrfentmen)"
export class RssError extends Error {}

function strip(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/\s+/g, " ").trim()
}

function parseFeed(xml: string): Array<{ title: string; link: string; pub: string }> {
  const out: Array<{ title: string; link: string; pub: string }> = []
  // Atom entries
  const atomRe = /<entry>([\s\S]*?)<\/entry>/g
  let m: RegExpExecArray | null
  while ((m = atomRe.exec(xml)) !== null) {
    const e = m[1]
    const title = /<title[^>]*>([\s\S]*?)<\/title>/.exec(e)?.[1] ?? ""
    const link = /<link[^>]*href="([^"]+)"/.exec(e)?.[1] ?? ""
    const pub = /<updated[^>]*>([\s\S]*?)<\/updated>/.exec(e)?.[1] ?? /<published[^>]*>([\s\S]*?)<\/published>/.exec(e)?.[1] ?? ""
    if (title) out.push({ title: strip(title), link, pub: strip(pub).slice(0, 10) })
  }
  // RSS items
  const rssRe = /<item>([\s\S]*?)<\/item>/g
  while ((m = rssRe.exec(xml)) !== null) {
    const e = m[1]
    const title = /<title[^>]*>([\s\S]*?)<\/title>/.exec(e)?.[1] ?? ""
    const link = /<link[^>]*>([\s\S]*?)<\/link>/.exec(e)?.[1] ?? ""
    const pub = /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/.exec(e)?.[1] ?? ""
    if (title) out.push({ title: strip(title), link: strip(link), pub: strip(pub).slice(0, 16) })
  }
  return out
}

export async function readFeed(args: { url?: string; limit?: number }): Promise<string> {
  const url = (args.url ?? "").trim()
  if (!/^https?:\/\//i.test(url)) throw new RssError("Provide a full http or https feed URL")
  const limit = Math.min(args.limit ?? 10, 25)
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" },
    redirect: "follow",
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new RssError(`Feed error ${res.status}`)
  const text = await res.text()
  const title = /<title[^>]*>([\s\S]*?)<\/title>/.exec(text)?.[1] ?? ""
  const entries = parseFeed(text).slice(0, limit)
  return `${strip(title) || "Feed"}\n${entries.map((e, i) =>
    `${i + 1}. ${e.title}\n   ${e.pub ? `${e.pub} | ` : ""}${e.link}`
  ).join("\n") || "No entries found"}`
}
