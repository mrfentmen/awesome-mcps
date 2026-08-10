import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { search } from "./api.js"
import { validate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "swift-bic-mcp", version: "1.0.0" })
  server.tool("search", "Search bank SWIFT or BIC codes.", { query: z.string().describe("BIC code, bank name, or country."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("validate", "Check the format of a BIC code.", { bic: z.string().describe("8 or 11 character BIC.") }, async (args) => {
    try { return text(await validate(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
