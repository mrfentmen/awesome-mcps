import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { agencies } from "./api.js"
import { searchAwards } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "usaspending-mcp", version: "1.0.0" })
  server.tool("agencies", "Top tier federal agencies.", {  }, async (args) => {
    try { return text(await agencies(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_awards", "Search federal awards by keyword.", { keyword: z.string().describe("Award keyword."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchAwards(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
