import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { zones } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "electricitymap-mcp", version: "1.0.0" })
  server.tool("zones", "List electricity zones.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await zones(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
