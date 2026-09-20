import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { nearest } from "./api.js"
import { route } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "osrm-mcp", version: "1.0.0" })
  server.registerTool(
    "route",
    {
      title: "Route",
      description: "Route between coordinates.",
      inputSchema: z.object( { coordinates: z.string().describe("lon,lat;lon,lat pairs."), profile: z.string().describe("driving, cycling, or walking.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await route(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "nearest",
    {
      title: "Nearest",
      description: "Nearest road point to a coordinate.",
      inputSchema: z.object( { longitude: z.number().describe("Longitude."), latitude: z.number().describe("Latitude."), profile: z.string().describe("driving, cycling, or walking.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await nearest(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
