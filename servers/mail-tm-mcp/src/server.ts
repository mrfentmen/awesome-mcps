import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { domains } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mail-tm-mcp", version: "1.0.0" })
  server.tool("domains", "List available domains.", {  }, async (args) => {
    try { return text(await domains(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
