import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { dataset } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "cdc-data-mcp", version: "1.0.0" })
  server.tool("dataset", "Query a CDC Socrata dataset.", { dataset_id: z.string().describe("Socrata dataset id like 9dzk-mvmi."), limit: z.number().describe("Max rows.").optional() }, async (args) => {
    try { return text(await dataset(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
