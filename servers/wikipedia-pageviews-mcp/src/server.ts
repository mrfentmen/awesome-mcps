import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { top } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "wikipedia-pageviews-mcp", version: "1.0.0" })
  server.tool("top", "Most viewed Wikipedia pages for a day.", { date: z.string().describe("Date like 2026-08-01.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await top(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
