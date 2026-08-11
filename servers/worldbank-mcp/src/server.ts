import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_countries, m0_indicator, m1_eiaSeries, m1_worldbankIndicator } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'worldbank-mcp', version: '1.0.0' })
server.tool("indicator", "Indicator series for a country.", { country: z.string().describe("Country code like USA."), indicatorCode: z.string().describe("Indicator code like NY.GDP.MKTP.CD."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_indicator(args)) } catch (e) { return text(error(e)) }
  })
server.tool("countries", "List World Bank countries.", {  }, async (args) => {
    try { return text(await m0_countries(args)) } catch (e) { return text(error(e)) }
  })
server.tool("get_worldbank_indicator", "Get a World Bank development indicator for a country.", { indicator: z.string().describe("Indicator code like EG.USE.ELEC.KH.PC."), country: z.string().describe("ISO country code like USA.").optional() }, async (args) => {
    try { return text(await m1_worldbankIndicator(args)) } catch (e) { return text(error(e)) }
  })
server.tool("get_eia_series", "Get an EIA energy series. Requires a free EIA key.", { series_id: z.string().describe("EIA series id.") }, async (args) => {
    try { return text(await m1_eiaSeries(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
