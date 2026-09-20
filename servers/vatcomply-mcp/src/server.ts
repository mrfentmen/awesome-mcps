import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { country } from "./api.js"
import { rates } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "vatcomply-mcp", version: "1.0.0" })
  server.registerTool(
    "rates",
    {
      title: "Rates",
      description: "Current VAT rates.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await rates(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "country",
    {
      title: "Country",
      description: "VAT details for a country.",
      inputSchema: z.object( { code: z.string().describe("ISO country code like DE.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await country(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
