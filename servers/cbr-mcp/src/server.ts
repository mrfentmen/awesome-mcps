import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { rates } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "cbr-mcp", version: "1.0.0" })
  server.tool("rates", "Daily exchange rates.", {  }, async (args) => {
    try { return text(await rates(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
