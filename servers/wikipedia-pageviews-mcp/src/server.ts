import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { top } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "wikipedia-pageviews-mcp", version: "1.0.0" })
  server.registerTool(
    "top",
    {
      title: "Top",
      description: "Most viewed Wikipedia pages for a day.",
      inputSchema: z.object( { date: z.string().describe("Date like 2026-08-01.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await top(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
