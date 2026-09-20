import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_book, m0_search, m1_bookInfo, m1_searchBooks } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'gutendex-mcp', version: '1.0.0' })
server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search Gutenberg books.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_search(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "book",
    {
      title: "Book",
      description: "Details for one book.",
      inputSchema: z.object( { id: z.number().describe("Gutenberg book ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_book(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "search_books",
    {
      title: "Search books",
      description: "Search Project Gutenberg books.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_searchBooks(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "book_info",
    {
      title: "Book info",
      description: "Get details for a Gutenberg book by ID.",
      inputSchema: z.object( { bookId: z.number().describe("Gutenberg book ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_bookInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
