import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { clientIp } from "./api.js"
import { reverseGeocode } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bigdatacloud-mcp", version: "1.0.0" })
  server.tool("client_ip", "Get caller IP details.", {  }, async (args) => {
    try { return text(await clientIp(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("reverse_geocode", "Reverse geocode coordinates to a location.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude.") }, async (args) => {
    try { return text(await reverseGeocode(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
