import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { current } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "wttr-mcp", version: "1.0.0" })
  server.tool("current", "Current weather for a place.", { location: z.string().describe("City name or coordinates.") }, async (args) => {
    try { return text(await current(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
