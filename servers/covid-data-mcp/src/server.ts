import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { country } from "./api.js"
import { global } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "covid-data-mcp", version: "1.0.0" })
  server.registerTool(
    "country",
    {
      title: "Country",
      description: "COVID stats for one country.",
      inputSchema: z.object( { name: z.string().describe("Country name or code.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await country(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "global",
    {
      title: "Global",
      description: "Global COVID totals.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await global(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
