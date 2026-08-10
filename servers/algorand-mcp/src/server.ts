import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { status } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "algorand-mcp", version: "1.0.0" })
  server.tool("status", "Current Algorand status.", {  }, async (args) => {
    try { return text(await status(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
