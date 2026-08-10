import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx"
import { writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const UA = "mrfentmen-document-generator-mcp/1.0"
export class DocError extends Error {}

function safeName(filename: string): string {
  const clean = filename.replace(/[^a-zA-Z0-9._-]/g, "_")
  return clean || "document.docx"
}

export async function createDoc(args: { title?: string; body?: string; filename?: string }): Promise<string> {
  const title = (args.title ?? "").trim()
  const body = (args.body ?? "")
  if (!title && !body) throw new DocError("Provide a title or body text")
  const paragraphs: Paragraph[] = []
  if (title) paragraphs.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(title)] }))
  for (const line of body.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
    paragraphs.push(new Paragraph({ children: [new TextRun(line)], spacing: { after: 120 } }))
  }
  const doc = new Document({ sections: [{ children: paragraphs }] })
  const buffer = await Packer.toBuffer(doc)
  const out = join(tmpdir(), safeName(args.filename ?? "document.docx"))
  writeFileSync(out, buffer)
  return `Word document written to ${out}\nTitle: ${title || "none"} | Paragraphs: ${paragraphs.length - (title ? 1 : 0)}`
}

export async function createReport(args: { title?: string; bullets?: string }): Promise<string> {
  const title = (args.title ?? "").trim()
  if (!title) throw new DocError("Provide a report title")
  const bullets = (args.bullets ?? "").split(",").map((b) => b.trim()).filter(Boolean)
  const children: Paragraph[] = [new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(title)] })]
  for (const b of bullets) {
    children.push(new Paragraph({ text: b, bullet: { level: 0 }, spacing: { after: 80 } }))
  }
  const doc = new Document({ sections: [{ children }] })
  const buffer = await Packer.toBuffer(doc)
  const out = join(tmpdir(), safeName(title.toLowerCase().replace(/\s+/g, "-") + "-report.docx"))
  writeFileSync(out, buffer)
  return `Report written to ${out}\nTitle: ${title} | Bullets: ${bullets.length}`
}
