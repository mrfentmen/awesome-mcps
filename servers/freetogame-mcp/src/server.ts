import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { game } from "./api.js"
import { games } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "freetogame-mcp", version: "1.0.0" })
  server.tool("games", "List free games with filters.", { platform: z.string().describe("pc, browser, or all.").optional(), category: z.string().describe("Category like shooter or mmorpg.").optional(), sortBy: z.string().describe("relevance or popularity.").optional() }, async (args) => {
    try { return text(await games(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("game", "Details for one game.", { id: z.number().describe("Game ID.") }, async (args) => {
    try { return text(await game(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
