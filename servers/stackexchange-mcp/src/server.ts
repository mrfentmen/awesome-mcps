import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { answers } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "stackexchange-mcp", version: "1.0.0" })
  server.tool("search", "Search questions on a site.", { query: z.string().describe("Search terms."), site: z.string().describe("Site like stackoverflow.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("answers", "Answers for a question.", { questionId: z.number().describe("Question ID."), site: z.string().describe("Site like stackoverflow.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await answers(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
