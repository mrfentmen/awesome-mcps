import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { schedule } from "./api.js"
import { standings } from "./api.js"
import { teams } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mlb-mcp", version: "1.0.0" })
  server.registerTool(
    "teams",
    {
      title: "Teams",
      description: "All MLB teams.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await teams(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "schedule",
    {
      title: "Schedule",
      description: "Games for a date.",
      inputSchema: z.object( { date: z.string().describe("Date like 2026-08-10."), teamId: z.number().describe("Optional team ID.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await schedule(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "standings",
    {
      title: "Standings",
      description: "Standings for a season.",
      inputSchema: z.object( { season: z.number().describe("Season year.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await standings(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
