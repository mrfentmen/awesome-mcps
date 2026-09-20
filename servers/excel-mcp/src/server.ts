import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createWorkbook } from "./api.js"
import { readWorkbook } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const WRITE = { readOnlyHint: false, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "excel-mcp", version: "1.0.0" })
  server.registerTool(
    "create_workbook",
    {
      title: "Create workbook",
      description: "Create an xlsx workbook from rows of comma separated values.",
      inputSchema: z.object( { sheet_name: z.string().describe("Sheet name.").optional(), rows: z.string().describe("Newline separated rows, each comma separated."), filename: z.string().describe("Output file name.").optional() }),
      annotations: WRITE,
    },
    async (args) => {
    try { return text(await createWorkbook(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "read_workbook",
    {
      title: "Read workbook",
      description: "Read the first rows of an xlsx workbook from a path.",
      inputSchema: z.object( { path: z.string().describe("Path to the xlsx file."), max_rows: z.number().describe("Max rows to read.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await readWorkbook(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
