import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { latest } from "./api.js"
import { map } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "aurora-forecast-mcp", version: "1.0.0" })
  server.tool("latest", "Latest aurora observation and forecast time.", {  }, async (args) => {
    try { return text(await latest(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("map", "Describe the aurora forecast map coverage.", {  }, async (args) => {
    try { return text(await map(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
