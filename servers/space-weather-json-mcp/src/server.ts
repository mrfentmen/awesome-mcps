import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { xrays } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "space-weather-json-mcp", version: "1.0.0" })
  server.tool("xrays", "Recent solar x ray flux readings.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await xrays(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
