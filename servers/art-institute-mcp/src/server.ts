import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_artwork, m0_search } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'art-institute-mcp', version: '1.0.0' })
server.tool("search", "Search artworks by text.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_search(args)) } catch (e) { return text(error(e)) }
  })
server.tool("artwork", "Details for one artwork.", { id: z.number().describe("Artwork ID.") }, async (args) => {
    try { return text(await m0_artwork(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
