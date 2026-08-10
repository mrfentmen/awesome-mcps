import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createWorkbook } from "./api.js"
import { readWorkbook } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "excel-mcp", version: "1.0.0" })
  server.tool("create_workbook", "Create an xlsx workbook from rows of comma separated values.", { sheet_name: z.string().describe("Sheet name.").optional(), rows: z.string().describe("Newline separated rows, each comma separated."), filename: z.string().describe("Output file name.").optional() }, async (args) => {
    try { return text(await createWorkbook(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("read_workbook", "Read the first rows of an xlsx workbook from a path.", { path: z.string().describe("Path to the xlsx file."), max_rows: z.number().describe("Max rows to read.").optional() }, async (args) => {
    try { return text(await readWorkbook(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
