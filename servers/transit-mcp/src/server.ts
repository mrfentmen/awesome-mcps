import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { nextArrivals } from "./api.js"
import { transitView } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "transit-mcp", version: "1.0.0" })
  server.tool("get_next_arrivals", "Get next train arrivals between two SEPTA stations.", { origin: z.string().describe("Origin station."), destination: z.string().describe("Destination station.") }, async (args) => {
    try { return text(await nextArrivals(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_transit_view", "Get live SEPTA vehicle positions for a route.", { route: z.string().describe("Route id.") }, async (args) => {
    try { return text(await transitView(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
