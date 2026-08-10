import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { countries } from "./api.js"
import { indicator } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "worldbank-mcp", version: "1.0.0" })
  server.tool("indicator", "Indicator series for a country.", { country: z.string().describe("Country code like USA."), indicatorCode: z.string().describe("Indicator code like NY.GDP.MKTP.CD."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await indicator(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("countries", "List World Bank countries.", {  }, async (args) => {
    try { return text(await countries(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
