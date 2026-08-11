import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_formatAuthor, m0_formatBook, m0_formatWork, m0_getAuthor, m0_getEditions, m0_getWork, m0_OpenLibraryError, m0_searchBooks, m1_lookup, m1_validate } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

const m0_key = z.string().min(1).describe("Open Library key such as /works/OL123W or OL123W")

export function createServer(): McpServer {
  const server = new McpServer({ name: 'open-library-mcp', version: '1.0.0' })
server.tool("search_books", "Search Open Library for books, authors, subjects, or ISBNs.", { query: z.string().min(1), limit: z.number().int().min(1).max(25).default(10) }, async ({ query, limit }) => {
    try { const result = await m0_searchBooks(query, limit); return text(`Open Library found ${result.numFound ?? 0} result(s) for "${query}":\n\n${(result.docs ?? []).map((d, i) => m0_formatBook(d, i)).join("\n\n")}`) } catch (e) { return text(error(e)) }
  })
server.tool("get_work", "Get detailed metadata for an Open Library work.", { m0_key }, async ({ m0_key: workKey }) => { try { return text(m0_formatWork(await m0_getWork(workKey))) } catch (e) { return text(error(e)) } })
server.tool("get_author", "Get metadata for an Open Library author.", { m0_key }, async ({ m0_key: authorKey }) => { try { return text(m0_formatAuthor(await m0_getAuthor(authorKey))) } catch (e) { return text(error(e)) } })
server.tool("list_editions", "List editions of an Open Library work.", { m0_key, limit: z.number().int().min(1).max(50).default(20) }, async ({ m0_key: workKey, limit }) => { try { const result = await m0_getEditions(workKey, limit); return text(`Editions for ${workKey}:\n\n${(result.docs ?? []).map((d, i) => m0_formatBook(d, i)).join("\n\n")}`) } catch (e) { return text(error(e)) } })
server.tool("validate", "Check an ISBN 10 or ISBN 13 checksum.", { isbn: z.string().describe("The ISBN to check.") }, async (args) => {
    try { return text(await m1_validate(args)) } catch (e) { return text(error(e)) }
  })
server.tool("lookup", "Look up a book by ISBN.", { isbn: z.string().describe("The ISBN to look up.") }, async (args) => {
    try { return text(await m1_lookup(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
