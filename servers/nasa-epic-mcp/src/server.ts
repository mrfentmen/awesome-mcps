import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { date } from "./api.js"
import { latest } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nasa-epic-mcp", version: "1.0.0" })
  server.registerTool(
    "latest",
    {
      title: "Latest",
      description: "Latest Earth images from EPIC.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await latest(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "date",
    {
      title: "Date",
      description: "Earth images for a date.",
      inputSchema: z.object( { date: z.string().describe("Date like 2026-08-01.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await date(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
