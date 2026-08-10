import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { institutions } from "./api.js"
import { largestBanks } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fdic-mcp", version: "1.0.0" })
  server.tool("search_institutions", "Search FDIC insured institutions by name.", { name: z.string().describe("Bank name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await institutions(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_largest_banks", "Get the largest FDIC insured institutions by assets.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await largestBanks(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
