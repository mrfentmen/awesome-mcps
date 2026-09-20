import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { bookInfo } from "./api.js"
import { searchBooks } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "books-mcp", version: "1.0.0" })
  server.registerTool(
    "search_books",
    {
      title: "Search books",
      description: "Search for books by title or author.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchBooks(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "book_info",
    {
      title: "Book info",
      description: "Get details for a specific book volume.",
      inputSchema: z.object( { volumeId: z.string().describe("Google Books volume ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await bookInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
