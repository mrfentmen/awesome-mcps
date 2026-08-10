import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { facts } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dog-facts-mcp", version: "1.0.0" })
  server.tool("facts", "Random dog facts.", { limit: z.number().describe("Number of facts.").optional() }, async (args) => {
    try { return text(await facts(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
