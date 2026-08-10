import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { cities } from "./api.js"
import { countries } from "./api.js"
import { flag } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "countriesnow-mcp", version: "1.0.0" })
  server.tool("countries", "List countries with ISO codes.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await countries(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("cities", "Cities for a country.", { country: z.string().describe("Country name like Brazil.") }, async (args) => {
    try { return text(await cities(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("flag", "Flag image URL for a country.", { country: z.string().describe("Country name.") }, async (args) => {
    try { return text(await flag(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
