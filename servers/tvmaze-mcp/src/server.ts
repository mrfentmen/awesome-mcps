import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { schedule } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "tvmaze-mcp", version: "1.0.0" })
  server.tool("search", "Search shows.", { query: z.string().describe("Show name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("schedule", "Schedule for a date and country.", { country: z.string().describe("ISO country like US.").optional(), date: z.string().describe("YYYY-MM-DD.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await schedule(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
