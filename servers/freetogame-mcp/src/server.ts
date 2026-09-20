import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { game } from "./api.js"
import { games } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "freetogame-mcp", version: "1.0.0" })
  server.registerTool(
    "games",
    {
      title: "Games",
      description: "List free games with filters.",
      inputSchema: z.object( { platform: z.string().describe("pc, browser, or all.").optional(), category: z.string().describe("Category like shooter or mmorpg.").optional(), sortBy: z.string().describe("relevance or popularity.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await games(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "game",
    {
      title: "Game",
      description: "Details for one game.",
      inputSchema: z.object( { id: z.number().describe("Game ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await game(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
