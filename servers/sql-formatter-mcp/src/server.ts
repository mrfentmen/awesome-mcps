import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "sql-formatter-mcp", version: "1.0.0" })
  server.tool("format", "Format a SQL query.", { sql: z.string().describe("The SQL query."), dialect: z.string().describe("sql, postgresql, mysql, or sqlite.").optional() }, async (args) => {
    try { return text(await format(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
