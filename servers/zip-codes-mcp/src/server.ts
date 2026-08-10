import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { cityLookup } from "./api.js"
import { zipLookup } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "zip-codes-mcp", version: "1.0.0" })
  server.tool("zip_lookup", "Get the city and state for a US zip code.", { zip: z.string().describe("Five digit US zip code.") }, async (args) => {
    try { return text(await zipLookup(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("city_lookup", "List zip codes for a city and state.", { city: z.string().describe("City name."), state: z.string().describe("Two letter state code.") }, async (args) => {
    try { return text(await cityLookup(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
