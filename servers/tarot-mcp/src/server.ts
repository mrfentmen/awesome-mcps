import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { cardInfo } from "./api.js"
import { randomCards } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "tarot-mcp", version: "1.0.0" })
  server.registerTool(
    "random_cards",
    {
      title: "Random cards",
      description: "Draw random tarot cards.",
      inputSchema: z.object( { count: z.number().describe("How many cards.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await randomCards(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "card_info",
    {
      title: "Card info",
      description: "Get the meaning of a specific card.",
      inputSchema: z.object( { card: z.string().describe("Card short name like ar00.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await cardInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
