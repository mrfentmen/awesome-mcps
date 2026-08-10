import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { character } from "./api.js"
import { characters } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "disney-mcp", version: "1.0.0" })
  server.tool("character", "Get a character by id or name.", { query: z.string().describe("Character name or id.") }, async (args) => {
    try { return text(await character(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("characters", "List characters.", { page: z.number().describe("Page number.").optional() }, async (args) => {
    try { return text(await characters(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
