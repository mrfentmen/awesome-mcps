import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { locate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "geolocation-db-mcp", version: "1.0.0" })
  server.tool("locate", "Location for your IP or one IP.", { ip: z.string().describe("IP address.").optional() }, async (args) => {
    try { return text(await locate(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
