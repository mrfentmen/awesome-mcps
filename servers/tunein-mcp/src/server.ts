import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { browse } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "tunein-mcp", version: "1.0.0" })
  server.tool("browse", "Browse radio categories.", {  }, async (args) => {
    try { return text(await browse(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
