import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { bookInfo } from "./api.js"
import { searchBooks } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "books-mcp", version: "1.0.0" })
  server.tool("search_books", "Search for books by title or author.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchBooks(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("book_info", "Get details for a specific book volume.", { volumeId: z.string().describe("Google Books volume ID.") }, async (args) => {
    try { return text(await bookInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
