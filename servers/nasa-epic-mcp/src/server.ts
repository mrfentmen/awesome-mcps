import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { date } from "./api.js"
import { latest } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nasa-epic-mcp", version: "1.0.0" })
  server.tool("latest", "Latest Earth images from EPIC.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await latest(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("date", "Earth images for a date.", { date: z.string().describe("Date like 2026-08-01.") }, async (args) => {
    try { return text(await date(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
