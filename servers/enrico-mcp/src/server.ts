import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { countries } from "./api.js"
import { holidays } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "enrico-mcp", version: "1.0.0" })
  server.registerTool(
    "countries",
    {
      title: "Countries",
      description: "List supported countries.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async () => {
    try { return text(await countries()) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "holidays",
    {
      title: "Holidays",
      description: "Public holidays for a country and year.",
      inputSchema: z.object( { country: z.string().describe("Country code like USA."), year: z.number().describe("Year.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await holidays(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
