import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_file, m0_search, m1_random } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'wikimedia-commons-mcp', version: '1.0.0' })
server.tool("search", "Search Commons files by text.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_search(args)) } catch (e) { return text(error(e)) }
  })
server.tool("file", "Details for one Commons file.", { title: z.string().describe("File title.") }, async (args) => {
    try { return text(await m0_file(args)) } catch (e) { return text(error(e)) }
  })
server.tool("random", "Random image files from Commons.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_random(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
