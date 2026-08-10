import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { list } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "datahub-countries-mcp", version: "1.0.0" })
  server.tool("list", "List countries with codes.", { search: z.string().describe("Optional search terms.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await list(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
