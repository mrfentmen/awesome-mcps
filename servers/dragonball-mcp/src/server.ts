import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { character } from "./api.js"
import { characters } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dragonball-mcp", version: "1.0.0" })
  server.tool("characters", "List characters.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await characters(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("character", "Get one character by name.", { name: z.string().describe("Character name.") }, async (args) => {
    try { return text(await character(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
