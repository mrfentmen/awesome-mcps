import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { crateInfo } from "./api.js"
import { searchCrates } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "crates-io-mcp", version: "1.0.0" })
  server.registerTool(
    "crate_info",
    {
      title: "Crate info",
      description: "Get details for a Rust crate.",
      inputSchema: z.object( { name: z.string().describe("Crate name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await crateInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "search_crates",
    {
      title: "Search crates",
      description: "Search crates.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchCrates(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
