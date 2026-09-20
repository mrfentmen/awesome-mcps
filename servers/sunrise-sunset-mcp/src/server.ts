import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { sunTimes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "sunrise-sunset-mcp", version: "1.0.0" })
  server.registerTool(
    "sun_times",
    {
      title: "Sun times",
      description: "Get sunrise and sunset times for a location and date.",
      inputSchema: z.object( { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude."), date: z.string().describe("Date in YYYY-MM-DD format.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await sunTimes(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
