import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { peopleInfo } from "./api.js"
import { planetInfo } from "./api.js"
import { searchPeople } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "star-wars-mcp", version: "1.0.0" })
  server.tool("people_info", "Get a Star Wars person by ID.", { id: z.number().describe("Person ID.") }, async (args) => {
    try { return text(await peopleInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("planet_info", "Get a Star Wars planet by ID.", { id: z.number().describe("Planet ID.") }, async (args) => {
    try { return text(await planetInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_people", "Search Star Wars characters by name.", { query: z.string().describe("Character name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchPeople(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
