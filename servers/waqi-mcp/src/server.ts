import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { city } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "waqi-mcp", version: "1.0.0" })
  server.tool("city", "AQI for a city.", { city: z.string().describe("City like beijing.") }, async (args) => {
    try { return text(await city(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
