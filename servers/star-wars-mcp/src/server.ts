import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { peopleInfo } from "./api.js"
import { planetInfo } from "./api.js"
import { searchPeople } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "star-wars-mcp", version: "1.0.0" })
  server.registerTool(
    "people_info",
    {
      title: "People info",
      description: "Get a Star Wars person by ID.",
      inputSchema: z.object( { id: z.number().describe("Person ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await peopleInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "planet_info",
    {
      title: "Planet info",
      description: "Get a Star Wars planet by ID.",
      inputSchema: z.object( { id: z.number().describe("Planet ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await planetInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "search_people",
    {
      title: "Search people",
      description: "Search Star Wars characters by name.",
      inputSchema: z.object( { query: z.string().describe("Character name."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchPeople(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
