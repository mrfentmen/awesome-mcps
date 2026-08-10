import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { addressInfo } from "./api.js"
import { blockInfo } from "./api.js"
import { feeEstimates } from "./api.js"
import { latestHeight } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "blockchain-mcp", version: "1.0.0" })
  server.tool("latest_height", "Get the latest Bitcoin block height.", {  }, async (args) => {
    try { return text(await latestHeight(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("block_info", "Get info about a Bitcoin block by height.", { height: z.number().describe("Block height.") }, async (args) => {
    try { return text(await blockInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("fee_estimates", "Get recommended Bitcoin transaction fee rates.", {  }, async (args) => {
    try { return text(await feeEstimates(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("address_info", "Get info about a Bitcoin address.", { address: z.string().describe("Bitcoin address.") }, async (args) => {
    try { return text(await addressInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
