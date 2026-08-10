import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byAuthor } from "./api.js"
import { randomPoem } from "./api.js"
import { searchTitles } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "poetry-mcp", version: "1.0.0" })
  server.tool("search_titles", "Search poems by title.", { title: z.string().describe("Poem title."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchTitles(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("by_author", "List poems by an author.", { author: z.string().describe("Author name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await byAuthor(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("random_poem", "Get a random poem.", {  }, async (args) => {
    try { return text(await randomPoem(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
