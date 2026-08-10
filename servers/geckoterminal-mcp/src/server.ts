import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { token } from "./api.js"
import { trending } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "geckoterminal-mcp", version: "1.0.0" })
  server.tool("token", "Get token info.", { network: z.string().describe("Network id like eth.").optional(), address: z.string().describe("Token address.") }, async (args) => {
    try { return text(await token(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("trending", "Trending pools.", { network: z.string().describe("Network id like eth.").optional() }, async (args) => {
    try { return text(await trending(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
