import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { describe } from "./api.js"
import { next } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "cron-mcp", version: "1.0.0" })
  server.tool("describe", "Describe a cron expression in words.", { expression: z.string().describe("5 field cron expression.") }, async (args) => {
    try { return text(await describe(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("next", "Next run times for a cron expression.", { expression: z.string().describe("5 field cron expression."), count: z.number().describe("Number of runs.").optional() }, async (args) => {
    try { return text(await next(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
