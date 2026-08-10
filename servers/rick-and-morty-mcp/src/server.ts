import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { character } from "./api.js"
import { episode } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "rick-and-morty-mcp", version: "1.0.0" })
  server.tool("character", "Character by ID.", { id: z.number().describe("Character ID.") }, async (args) => {
    try { return text(await character(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Search characters.", { name: z.string().describe("Name."), limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("episode", "Episode by ID.", { id: z.number().describe("Episode ID.") }, async (args) => {
    try { return text(await episode(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
