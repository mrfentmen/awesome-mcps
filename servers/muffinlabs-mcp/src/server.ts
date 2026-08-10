import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { day } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "muffinlabs-mcp", version: "1.0.0" })
  server.tool("day", "Events for a date.", { month: z.number().describe("Month.").optional(), day: z.number().describe("Day.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await day(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
