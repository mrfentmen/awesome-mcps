import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { app } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "steamspy-mcp", version: "1.0.0" })
  server.tool("app", "Player statistics for one Steam app.", { appid: z.number().describe("Steam app id.") }, async (args) => {
    try { return text(await app(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
