import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { position } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "iss-position-mcp", version: "1.0.0" })
  server.tool("position", "Current ISS position.", {  }, async (args) => {
    try { return text(await position(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
