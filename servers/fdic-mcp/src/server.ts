import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { institutions } from "./api.js"
import { largestBanks } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fdic-mcp", version: "1.0.0" })
  server.registerTool(
    "search_institutions",
    {
      title: "Search institutions",
      description: "Search FDIC insured institutions by name.",
      inputSchema: z.object( { name: z.string().describe("Bank name."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await institutions(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "get_largest_banks",
    {
      title: "Get largest banks",
      description: "Get the largest FDIC insured institutions by assets.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await largestBanks(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
