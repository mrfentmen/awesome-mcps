import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { depth } from "./api.js"
import { ticker } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "htx-mcp", version: "1.0.0" })
  server.registerTool(
    "ticker",
    {
      title: "Ticker",
      description: "Get a market ticker.",
      inputSchema: z.object( { symbol: z.string().describe("Symbol like btcusdt.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await ticker(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "depth",
    {
      title: "Depth",
      description: "Get order book depth.",
      inputSchema: z.object( { symbol: z.string().describe("Symbol like btcusdt."), depth: z.number().describe("Depth steps.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await depth(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
