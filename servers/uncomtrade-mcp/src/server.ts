import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { trade } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "uncomtrade-mcp", version: "1.0.0" })
  server.tool("trade", "Preview trade data.", { reporter: z.number().describe("Reporter code like 842."), period: z.string().describe("Period like 2023.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await trade(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
