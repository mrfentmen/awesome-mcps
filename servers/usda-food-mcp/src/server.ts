import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_search, m1_searchFood } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'usda-food-mcp', version: '1.0.0' })
server.tool("search", "Search USDA foods.", { query: z.string().describe("Food search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_search(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search_food", "Search foods by name and get nutrition facts.", { query: z.string().describe("Food name like banana."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_searchFood(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
