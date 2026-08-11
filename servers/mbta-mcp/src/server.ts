import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { routes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mbta-mcp", version: "1.0.0" })
  server.tool("routes", "List transit routes.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await routes(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
