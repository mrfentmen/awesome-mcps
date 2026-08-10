import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { writeFileSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

export class PdfError extends Error {}

function outPath(name: string): string {
  const safe = /^[\w.\- ]+$/.test(name) && name.endsWith(".pdf") ? name : `doc-${Date.now()}.pdf`
  return join(mkdtempSync(join(tmpdir(), "pdfgen-")), safe)
}

async function wrapLines(pdf: PDFDocument, font: any, text: string, maxWidth: number): Promise<string[]> {
  const lines: string[] = []
  for (const raw of text.split("\n")) {
    let cur = ""
    for (const word of raw.split(" ")) {
      const test = cur ? `${cur} ${word}` : word
      if (font.widthOfTextAtSize(test, 11) > maxWidth && cur) {
        lines.push(cur)
        cur = word
      } else {
        cur = test
      }
    }
    lines.push(cur)
  }
  return lines
}

export async function createPdf(args: { title?: string; body?: string; filename?: string }): Promise<string> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const page = pdf.addPage([612, 792])
  page.drawText(args.title ?? "Untitled", { x: 60, y: 740, size: 24, font: bold, color: rgb(0.1, 0.1, 0.1) })
  let y = 700
  const bodyLines = await wrapLines(pdf, font, args.body ?? "", 492)
  for (const line of bodyLines) {
    if (y < 60) {
      pdf.addPage([612, 792])
      y = 740
    }
    if (line.trim()) {
      pdf.getPage(pdf.getPageCount() - 1).drawText(line.slice(0, 110), { x: 60, y, size: 11, font, color: rgb(0.15, 0.15, 0.15) })
    }
    y -= 16
  }
  const bytes = await pdf.save()
  const path = outPath(args.filename ?? `doc-${Date.now()}.pdf`)
  writeFileSync(path, bytes)
  return `Created ${path} (${bytes.length} bytes, ${pdf.getPageCount()} pages)`
}

export async function createReport(args: { title?: string; author?: string; bullets?: string }): Promise<string> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const page = pdf.addPage([612, 792])
  page.drawText(args.title ?? "Report", { x: 60, y: 740, size: 26, font: bold })
  let y = 700
  if (args.author) {
    page.drawText(`By ${args.author}`, { x: 60, y, size: 12, font })
    y -= 30
  }
  const bullets = (args.bullets ?? "").split(",").map((b) => b.trim()).filter(Boolean)
  for (const b of bullets) {
    if (y < 60) break
    page.drawText(`- ${b.slice(0, 90)}`, { x: 60, y, size: 11, font })
    y -= 18
  }
  const bytes = await pdf.save()
  const path = outPath(`report-${Date.now()}.pdf`)
  writeFileSync(path, bytes)
  return `Created ${path} (${bytes.length} bytes)`
}
