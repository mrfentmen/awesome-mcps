import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { ask } from "./api.js"
import { item } from "./api.js"
import { jobs } from "./api.js"
import { top } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "hacker-news-mcp", version: "1.0.0" })
  server.tool("top", "Top stories.", { limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await top(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("jobs", "Latest job postings.", { limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await jobs(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("ask", "Latest ask threads.", { limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await ask(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("item", "One story or comment by ID.", { id: z.number().describe("Item ID.") }, async (args) => {
    try { return text(await item(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
