import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { eiaSeries } from "./api.js"
import { worldbankIndicator } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "energy-climate-mcp", version: "1.0.0" })
  server.tool("get_worldbank_indicator", "Get a World Bank development indicator for a country.", { indicator: z.string().describe("Indicator code like EG.USE.ELEC.KH.PC."), country: z.string().describe("ISO country code like USA.").optional() }, async (args) => {
    try { return text(await worldbankIndicator(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_eia_series", "Get an EIA energy series. Requires a free EIA key.", { series_id: z.string().describe("EIA series id.") }, async (args) => {
    try { return text(await eiaSeries(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
