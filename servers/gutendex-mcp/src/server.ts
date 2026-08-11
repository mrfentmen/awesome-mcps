import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_book, m0_search, m1_bookInfo, m1_searchBooks } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'gutendex-mcp', version: '1.0.0' })
server.tool("search", "Search Gutenberg books.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_search(args)) } catch (e) { return text(error(e)) }
  })
server.tool("book", "Details for one book.", { id: z.number().describe("Gutenberg book ID.") }, async (args) => {
    try { return text(await m0_book(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search_books", "Search Project Gutenberg books.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_searchBooks(args)) } catch (e) { return text(error(e)) }
  })
server.tool("book_info", "Get details for a Gutenberg book by ID.", { bookId: z.number().describe("Gutenberg book ID.") }, async (args) => {
    try { return text(await m1_bookInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
