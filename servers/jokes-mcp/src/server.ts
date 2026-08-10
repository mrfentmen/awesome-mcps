import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { randomJoke } from "./api.js"
import { searchJokes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "jokes-mcp", version: "1.0.0" })
  server.tool("random_joke", "Get a random dad joke.", {  }, async (args) => {
    try { return text(await randomJoke(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_jokes", "Search for dad jokes.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchJokes(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
