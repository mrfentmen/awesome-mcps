import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { describe } from "./api.js"
import { next } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "cron-mcp", version: "1.0.0" })
  server.registerTool(
    "describe",
    {
      title: "Describe",
      description: "Describe a cron expression in words.",
      inputSchema: z.object( { expression: z.string().describe("5 field cron expression.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await describe(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "next",
    {
      title: "Next",
      description: "Next run times for a cron expression.",
      inputSchema: z.object( { expression: z.string().describe("5 field cron expression."), count: z.number().describe("Number of runs.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await next(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
