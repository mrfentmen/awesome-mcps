import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { laureates } from "./api.js"
import { prizes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nobel-mcp", version: "1.0.0" })
  server.tool("laureates", "List Nobel laureates, optionally by year.", { year: z.number().describe("Prize year.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await laureates(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("prizes", "List Nobel prizes by year.", { year: z.number().describe("Prize year.").optional() }, async (args) => {
    try { return text(await prizes(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
