import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { breeds } from "./api.js"
import { fact } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "catfact-mcp", version: "1.0.0" })
  server.tool("fact", "Random cat fact.", {  }, async (args) => {
    try { return text(await fact(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("breeds", "List cat breeds.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await breeds(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
