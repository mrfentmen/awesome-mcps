import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { addressInfo } from "./api.js"
import { blockInfo } from "./api.js"
import { feeEstimates } from "./api.js"
import { latestHeight } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "blockchain-mcp", version: "1.0.0" })
  server.registerTool(
    "latest_height",
    {
      title: "Latest height",
      description: "Get the latest Bitcoin block height.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await latestHeight(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "block_info",
    {
      title: "Block info",
      description: "Get info about a Bitcoin block by height.",
      inputSchema: z.object( { height: z.number().describe("Block height.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await blockInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "fee_estimates",
    {
      title: "Fee estimates",
      description: "Get recommended Bitcoin transaction fee rates.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await feeEstimates(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "address_info",
    {
      title: "Address info",
      description: "Get info about a Bitcoin address.",
      inputSchema: z.object( { address: z.string().describe("Bitcoin address.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await addressInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
