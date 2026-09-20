import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { moonOnDate } from "./api.js"
import { moonPhase } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "moon-phase-mcp", version: "1.0.0" })
  server.registerTool(
    "moon_phase",
    {
      title: "Moon phase",
      description: "Get the current moon phase and illumination.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await moonPhase(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "moon_on_date",
    {
      title: "Moon on date",
      description: "Get the moon phase for a date.",
      inputSchema: z.object( { date: z.string().describe("Date in YYYY-MM-DD format.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await moonOnDate(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
