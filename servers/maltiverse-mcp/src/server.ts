import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { ip } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "maltiverse-mcp", version: "1.0.0" })
  server.tool("ip", "Threat data for an IP address.", { address: z.string().describe("IP address.") }, async (args) => {
    try { return text(await ip(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
