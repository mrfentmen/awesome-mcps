import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { csvInfo } from "./api.js"
import { parseCsv } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "csv-mcp", version: "1.0.0" })
  server.tool("parse_csv", "Parse CSV text into a table view.", { csv: z.string().describe("CSV text."), max_rows: z.number().describe("Max rows.").optional() }, async (args) => {
    try { return text(await parseCsv(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("csv_info", "Return columns and row count for CSV text.", { csv: z.string().describe("CSV text.") }, async (args) => {
    try { return text(await csvInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
