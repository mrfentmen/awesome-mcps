import { marked } from "marked"

export class MdError extends Error {}

export async function toHtml(args: { markdown?: string }): Promise<string> {
  const md = args.markdown ?? ""
  if (!md.trim()) throw new MdError("Provide markdown text")
  const html = await marked.parse(md)
  return html.slice(0, 8000)
}

export async function headings(args: { markdown?: string }): Promise<string> {
  const md = args.markdown ?? ""
  const lines = md.split("\n")
  const out: string[] = []
  for (const line of lines) {
    const m = /^(#{1,6})\s+(.*)$/.exec(line)
    if (m) out.push(`${"  ".repeat(m[1].length - 1)}${m[1].length}. ${m[2]}`)
  }
  return out.join("\n") || "No headings found"
}
