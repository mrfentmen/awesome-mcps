import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { fredSeries } from "./api.js"
import { treasuryRates } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "financial-data-mcp", version: "1.0.0" })
  server.tool("get_fred_series", "Get a FRED economic series such as GDP or unemployment.", { series_id: z.string().describe("FRED series id like GDP or UNRATE."), limit: z.number().describe("Max data points.").optional() }, async (args) => {
    try { return text(await fredSeries(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_treasury_rates", "Get the latest US Treasury yield curve rates.", {  }, async (args) => {
    try { return text(await treasuryRates(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
