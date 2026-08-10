import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { chainTvl } from "./api.js"
import { protocolInfo } from "./api.js"
import { topProtocols } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "defi-tvl-mcp", version: "1.0.0" })
  server.tool("top_protocols", "Get the top DeFi protocols by TVL.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await topProtocols(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("chain_tvl", "Get TVL for all chains.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await chainTvl(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("protocol_info", "Get details for a specific protocol.", { protocol: z.string().describe("Protocol slug.") }, async (args) => {
    try { return text(await protocolInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
