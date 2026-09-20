import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { chain } from "./api.js"
import { stats } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "blockchair-mcp", version: "1.0.0" })
  server.registerTool(
    "stats",
    {
      title: "Stats",
      description: "Bitcoin network stats.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await stats(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "chain",
    {
      title: "Chain",
      description: "Stats for a chain.",
      inputSchema: z.object( { chain: z.string().describe("Chain like bitcoin.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await chain(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
