import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { random } from "./api.js"
import { search } from "./api.js"
import { summary } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "wikipedia-mcp", version: "1.0.0" })
  server.tool("search", "Search Wikipedia for articles matching a query.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("summary", "Get the lead summary for a Wikipedia article.", { title: z.string().describe("Article title.") }, async (args) => {
    try { return text(await summary(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("random", "Get a random Wikipedia article summary.", {  }, async (args) => {
    try { return text(await random(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
