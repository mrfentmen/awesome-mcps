import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { dateDiff } from "./api.js"
import { fromTimestamp } from "./api.js"
import { now } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "time-tools-mcp", version: "1.0.0" })
  server.registerTool(
    "now",
    {
      title: "Now",
      description: "Current time in several formats.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await now(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "from_timestamp",
    {
      title: "From timestamp",
      description: "Convert a unix timestamp to a date.",
      inputSchema: z.object( { timestamp: z.number().describe("Unix seconds.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await fromTimestamp(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "date_diff",
    {
      title: "Date diff",
      description: "Days between two dates.",
      inputSchema: z.object( { start: z.string().describe("Start date YYYY-MM-DD."), end: z.string().describe("End date YYYY-MM-DD.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await dateDiff(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
