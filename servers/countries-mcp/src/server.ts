import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byCode } from "./api.js"
import { byName } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "countries-mcp", version: "1.0.0" })
  server.tool("by_name", "Get details for a country by name.", { name: z.string().describe("Country name.") }, async (args) => {
    try { return text(await byName(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("by_code", "Get details for a country by code.", { code: z.string().describe("Two letter country code.") }, async (args) => {
    try { return text(await byCode(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Search countries by partial name.", { query: z.string().describe("Partial name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
