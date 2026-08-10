import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { summary } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "noaa-ncei-mcp", version: "1.0.0" })
  server.tool("summary", "Daily summary for a station and date range.", { station: z.string().describe("Station id like USW00013739."), start: z.string().describe("Start date YYYY-MM-DD."), end: z.string().describe("End date YYYY-MM-DD.").optional() }, async (args) => {
    try { return text(await summary(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
