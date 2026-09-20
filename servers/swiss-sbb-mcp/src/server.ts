import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { connections } from "./api.js"
import { stationboard } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "swiss-sbb-mcp", version: "1.0.0" })
  server.registerTool(
    "connections",
    {
      title: "Connections",
      description: "Connections between stations.",
      inputSchema: z.object( { from: z.string().describe("Origin station."), to: z.string().describe("Destination station."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await connections(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "stationboard",
    {
      title: "Stationboard",
      description: "Departures at a station.",
      inputSchema: z.object( { station: z.string().describe("Station name."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await stationboard(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
