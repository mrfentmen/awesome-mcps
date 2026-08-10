import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { myip } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ipify-mcp", version: "1.0.0" })
  server.tool("myip", "Your public IP address.", {  }, async (args) => {
    try { return text(await myip(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
