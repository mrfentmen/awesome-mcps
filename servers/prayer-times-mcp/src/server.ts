import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { timings } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "prayer-times-mcp", version: "1.0.0" })
  server.registerTool(
    "timings",
    {
      title: "Timings",
      description: "Prayer times for a city.",
      inputSchema: z.object( { city: z.string().describe("City name."), country: z.string().describe("Country name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await timings(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
