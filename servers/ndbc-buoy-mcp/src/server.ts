import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { station } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ndbc-buoy-mcp", version: "1.0.0" })
  server.tool("station", "Latest observations for a buoy station.", { stationId: z.string().describe("Station ID like 41008.") }, async (args) => {
    try { return text(await station(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
