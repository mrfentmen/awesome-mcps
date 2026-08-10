import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { ledgers } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "stellar-mcp", version: "1.0.0" })
  server.tool("ledgers", "Recent Stellar ledgers.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await ledgers(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
