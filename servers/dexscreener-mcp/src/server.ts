import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { search } from "./api.js"
import { tokens } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dexscreener-mcp", version: "1.0.0" })
  server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search token pairs.",
      inputSchema: z.object( { query: z.string().describe("Token symbol or name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "tokens",
    {
      title: "Tokens",
      description: "Top pairs for a token.",
      inputSchema: z.object( { address: z.string().describe("Token address.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await tokens(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
