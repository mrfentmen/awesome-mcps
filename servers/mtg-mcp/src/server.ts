import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { cards } from "./api.js"
import { sets } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mtg-mcp", version: "1.0.0" })
  server.registerTool(
    "cards",
    {
      title: "Cards",
      description: "Search cards.",
      inputSchema: z.object( { name: z.string().describe("Card name."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await cards(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "sets",
    {
      title: "Sets",
      description: "List card sets.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await sets(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
