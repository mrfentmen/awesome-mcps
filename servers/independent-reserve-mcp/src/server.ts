import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { ticker } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "independent-reserve-mcp", version: "1.0.0" })
  server.tool("ticker", "Market summary for a pair.", { primary: z.string().describe("Primary currency like btc."), secondary: z.string().describe("Secondary like usd.") }, async (args) => {
    try { return text(await ticker(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
