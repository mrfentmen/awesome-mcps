import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { weather } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "brightsky-mcp", version: "1.0.0" })
  server.registerTool(
    "weather",
    {
      title: "Weather",
      description: "Weather for coordinates.",
      inputSchema: z.object( { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude."), date: z.string().describe("YYYY-MM-DD.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await weather(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
