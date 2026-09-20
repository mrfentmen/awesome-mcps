import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { fredSeries } from "./api.js"
import { treasuryRates } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "financial-data-mcp", version: "1.0.0" })
  server.registerTool(
    "get_fred_series",
    {
      title: "Get fred series",
      description: "Get a FRED economic series such as GDP or unemployment.",
      inputSchema: z.object( { series_id: z.string().describe("FRED series id like GDP or UNRATE."), limit: z.number().describe("Max data points.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await fredSeries(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "get_treasury_rates",
    {
      title: "Get treasury rates",
      description: "Get the latest US Treasury yield curve rates.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await treasuryRates(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
