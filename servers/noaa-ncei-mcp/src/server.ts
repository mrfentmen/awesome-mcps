import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { summary } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "noaa-ncei-mcp", version: "1.0.0" })
  server.registerTool(
    "summary",
    {
      title: "Summary",
      description: "Daily summary for a station and date range.",
      inputSchema: z.object( { station: z.string().describe("Station id like USW00013739."), start: z.string().describe("Start date YYYY-MM-DD."), end: z.string().describe("End date YYYY-MM-DD.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await summary(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
