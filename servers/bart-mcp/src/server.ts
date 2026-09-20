import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { etd } from "./api.js"
import { stations } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bart-mcp", version: "1.0.0" })
  server.registerTool(
    "etd",
    {
      title: "Etd",
      description: "Estimated departures for a station.",
      inputSchema: z.object( { station: z.string().describe("Station abbreviation.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await etd(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "stations",
    {
      title: "Stations",
      description: "List stations.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await stations(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
