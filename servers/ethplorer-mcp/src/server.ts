import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { addressInfo } from "./api.js"
import { tokenHistory } from "./api.js"
import { tokenInfo } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ethplorer-mcp", version: "1.0.0" })
  server.tool("token_info", "Get ERC-20 token details by address.", { address: z.string().describe("Token contract address.") }, async (args) => {
    try { return text(await tokenInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("address_info", "Get token holdings for an address.", { address: z.string().describe("Wallet address.") }, async (args) => {
    try { return text(await addressInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("token_history", "Get token transfer history.", { address: z.string().describe("Token address."), limit: z.number().describe("Max records.").optional() }, async (args) => {
    try { return text(await tokenHistory(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
