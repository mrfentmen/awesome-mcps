import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { station } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ndbc-buoy-mcp", version: "1.0.0" })
  server.registerTool(
    "station",
    {
      title: "Station",
      description: "Latest observations for a buoy station.",
      inputSchema: z.object( { stationId: z.string().describe("Station ID like 41008.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await station(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
