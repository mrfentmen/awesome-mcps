import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { slot } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "solana-mcp", version: "1.0.0" })
  server.tool("slot", "Current Solana slot.", {  }, async (args) => {
    try { return text(await slot(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
