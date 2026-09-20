import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { cities } from "./api.js"
import { forecast } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ipma-mcp", version: "1.0.0" })
  server.registerTool(
    "cities",
    {
      title: "Cities",
      description: "List forecast cities.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await cities(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "forecast",
    {
      title: "Forecast",
      description: "Daily forecast for a city.",
      inputSchema: z.object( { id: z.number().describe("City global id."), limit: z.number().describe("Max days.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await forecast(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
