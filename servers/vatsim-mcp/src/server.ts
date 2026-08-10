import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { controllers } from "./api.js"
import { pilots } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "vatsim-mcp", version: "1.0.0" })
  server.tool("pilots", "Connected pilots.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await pilots(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("controllers", "Connected ATC controllers.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await controllers(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
