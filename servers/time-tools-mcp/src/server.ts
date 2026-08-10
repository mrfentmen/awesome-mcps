import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { dateDiff } from "./api.js"
import { fromTimestamp } from "./api.js"
import { now } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "time-tools-mcp", version: "1.0.0" })
  server.tool("now", "Current time in several formats.", {  }, async (args) => {
    try { return text(await now(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("from_timestamp", "Convert a unix timestamp to a date.", { timestamp: z.number().describe("Unix seconds.") }, async (args) => {
    try { return text(await fromTimestamp(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("date_diff", "Days between two dates.", { start: z.string().describe("Start date YYYY-MM-DD."), end: z.string().describe("End date YYYY-MM-DD.") }, async (args) => {
    try { return text(await dateDiff(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
