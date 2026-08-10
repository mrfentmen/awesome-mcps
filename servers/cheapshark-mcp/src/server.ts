import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { deals } from "./api.js"
import { storeList } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "cheapshark-mcp", version: "1.0.0" })
  server.tool("deals", "Search current game deals.", { title: z.string().describe("Game title.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await deals(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("store_list", "List stores tracked by CheapShark.", {  }, async (args) => {
    try { return text(await storeList(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
