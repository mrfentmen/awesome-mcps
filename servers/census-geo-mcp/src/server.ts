import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { coordinates } from "./api.js"
import { geocode } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "census-geo-mcp", version: "1.0.0" })
  server.registerTool(
    "geocode",
    {
      title: "Geocode",
      description: "Geocode a street address.",
      inputSchema: z.object( { address: z.string().describe("Street address.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await geocode(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "coordinates",
    {
      title: "Coordinates",
      description: "Reverse geocode coordinates.",
      inputSchema: z.object( { x: z.number().describe("Longitude."), y: z.number().describe("Latitude.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await coordinates(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
