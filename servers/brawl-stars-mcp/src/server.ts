import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { brawler } from "./api.js"
import { brawlers } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "brawl-stars-mcp", version: "1.0.0" })
  server.registerTool(
    "brawlers",
    {
      title: "Brawlers",
      description: "List all Brawl Stars brawlers.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await brawlers()) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "brawler",
    {
      title: "Brawler",
      description: "Get a single brawler by name.",
      inputSchema: z.object( { name: z.string().describe("Brawler name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await brawler(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
