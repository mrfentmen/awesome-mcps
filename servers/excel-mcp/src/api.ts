import ExcelJS from "exceljs"
import { writeFileSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

export class ExcelError extends Error {}

function outPath(name: string): string {
  const safe = /^[\w.\- ]+$/.test(name) && name.endsWith(".xlsx") ? name : `workbook-${Date.now()}.xlsx`
  return join(mkdtempSync(join(tmpdir(), "xlsx-")), safe)
}

export async function createWorkbook(args: { sheet_name?: string; rows?: string; filename?: string }): Promise<string> {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet(args.sheet_name ?? "Sheet1")
  const lines = (args.rows ?? "").split("\n").map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) throw new ExcelError("Provide at least one row of comma separated values")
  for (const line of lines.slice(0, 500)) {
    const cells = line.split(",").map((c) => c.trim())
    const nums = cells.map((c) => (/^-?\d+(\.\d+)?$/.test(c) ? Number(c) : c))
    ws.addRow(nums)
  }
  const path = outPath(args.filename ?? `workbook-${Date.now()}.xlsx`)
  await wb.xlsx.writeFile(path)
  return `Created ${path} (${lines.length} rows)`
}

export async function readWorkbook(args: { path?: string; max_rows?: number }): Promise<string> {
  const path = args.path ?? ""
  if (!path) throw new ExcelError("Provide a path to an xlsx file")
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(path)
  const ws = wb.worksheets[0]
  if (!ws) throw new ExcelError("The workbook has no sheets")
  const max = Math.min(args.max_rows ?? 20, 100)
  const out: string[] = []
  ws.eachRow({ includeEmpty: false }, (row, n) => {
    if (n > max) return
    const vals = (row.values as unknown[])
    out.push(`${n}. ${vals.slice(1).map((v) => String(v)).join(" | ")}`)
  })
  return `${ws.name} (${ws.rowCount} rows)\n${out.join("\n")}`
}
