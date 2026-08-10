import TurndownService from "turndown"

export class HtmlMdError extends Error {}

export async function convert(args: { html?: string; max_length?: number }): Promise<string> {
  const html = args.html ?? ""
  if (!html.trim()) throw new HtmlMdError("Provide HTML text")
  const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" })
  let out = td.turndown(html).replace(/\n{3,}/g, "\n\n").trim()
  const max = Math.min(Math.max(args.max_length ?? 8000, 500), 30000)
  if (out.length > max) out = out.slice(0, max) + "\n[...truncated]"
  return out || "(empty result)"
}
