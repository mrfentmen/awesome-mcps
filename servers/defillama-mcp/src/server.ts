import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { chains } from "./api.js"
import { protocol } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "defillama-mcp", version: "1.0.0" })
  server.tool("chains", "TVL by chain.", {  }, async (args) => {
    try { return text(await chains(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("protocol", "TVL history for a protocol.", { slug: z.string().describe("Protocol slug.") }, async (args) => {
    try { return text(await protocol(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
