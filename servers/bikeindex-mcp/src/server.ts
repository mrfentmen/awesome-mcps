import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { bike } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bikeindex-mcp", version: "1.0.0" })
  server.tool("search", "Search bikes.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("bike", "Get a bike by id.", { id: z.number().describe("Bike id.") }, async (args) => {
    try { return text(await bike(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
