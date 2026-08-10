import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byCity } from "./api.js"
import { byState } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "breweries-mcp", version: "1.0.0" })
  server.tool("by_city", "List breweries in a city.", { city: z.string().describe("City name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await byCity(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Search breweries by name.", { query: z.string().describe("Brewery name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("by_state", "List breweries in a state.", { state: z.string().describe("State name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await byState(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
