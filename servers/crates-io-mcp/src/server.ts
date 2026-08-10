import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { crateInfo } from "./api.js"
import { searchCrates } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "crates-io-mcp", version: "1.0.0" })
  server.tool("crate_info", "Get details for a Rust crate.", { name: z.string().describe("Crate name.") }, async (args) => {
    try { return text(await crateInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_crates", "Search crates.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchCrates(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
