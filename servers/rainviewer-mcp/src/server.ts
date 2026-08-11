import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { radar } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "rainviewer-mcp", version: "1.0.0" })
  server.tool("radar", "Current radar tile index.", {  }, async (args) => {
    try { return text(await radar(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
