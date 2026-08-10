import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { timeline } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "rain-radar-mcp", version: "1.0.0" })
  server.tool("timeline", "Radar tile timeline with past, nowcast, and forecast frames.", {  }, async (args) => {
    try { return text(await timeline(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
