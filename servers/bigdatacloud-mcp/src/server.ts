import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { clientIp } from "./api.js"
import { reverseGeocode } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bigdatacloud-mcp", version: "1.0.0" })
  server.registerTool(
    "client_ip",
    {
      title: "Client ip",
      description: "Get caller IP details.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await clientIp(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "reverse_geocode",
    {
      title: "Reverse geocode",
      description: "Reverse geocode coordinates to a location.",
      inputSchema: z.object( { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await reverseGeocode(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
