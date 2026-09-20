import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { forecast } from "./api.js"
import { intensity } from "./api.js"
import { regional } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "carbon-intensity-mcp", version: "1.0.0" })
  server.registerTool(
    "intensity",
    {
      title: "Intensity",
      description: "Current UK grid carbon intensity.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await intensity(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "forecast",
    {
      title: "Forecast",
      description: "Carbon intensity forecast for the next 48 hours.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await forecast(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "regional",
    {
      title: "Regional",
      description: "Carbon intensity by region.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await regional(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
