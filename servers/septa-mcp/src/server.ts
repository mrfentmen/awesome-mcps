import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { next } from "./api.js"
import { stops } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "septa-mcp", version: "1.0.0" })
  server.tool("next", "Next arrivals between two stations.", { from: z.string().describe("Origin station."), to: z.string().describe("Destination station."), count: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await next(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("stops", "Stops for a route.", { route: z.string().describe("Route id.") }, async (args) => {
    try { return text(await stops(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
