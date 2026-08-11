import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { status } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mcstatus-mcp", version: "1.0.0" })
  server.tool("status", "Get Minecraft server status.", { host: z.string().describe("Server host or IP."), port: z.number().describe("Server port.").optional() }, async (args) => {
    try { return text(await status(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
