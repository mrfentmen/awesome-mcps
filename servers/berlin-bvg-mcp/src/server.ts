import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { departures } from "./api.js"
import { stops } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "berlin-bvg-mcp", version: "1.0.0" })
  server.registerTool(
    "stops",
    {
      title: "Stops",
      description: "Search stops.",
      inputSchema: z.object( { query: z.string().describe("Stop name."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await stops(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "departures",
    {
      title: "Departures",
      description: "Departures at a stop.",
      inputSchema: z.object( { id: z.string().describe("Stop id."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await departures(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
