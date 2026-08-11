import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_cities, m0_countries, m0_flag, m1_byCode, m1_byName, m1_search } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'countriesnow-mcp', version: '1.0.0' })
server.tool("countries", "List countries with ISO codes.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_countries(args)) } catch (e) { return text(error(e)) }
  })
server.tool("cities", "Cities for a country.", { country: z.string().describe("Country name like Brazil.") }, async (args) => {
    try { return text(await m0_cities(args)) } catch (e) { return text(error(e)) }
  })
server.tool("flag", "Flag image URL for a country.", { country: z.string().describe("Country name.") }, async (args) => {
    try { return text(await m0_flag(args)) } catch (e) { return text(error(e)) }
  })
server.tool("by_name", "Get details for a country by name.", { name: z.string().describe("Country name.") }, async (args) => {
    try { return text(await m1_byName(args)) } catch (e) { return text(error(e)) }
  })
server.tool("by_code", "Get details for a country by code.", { code: z.string().describe("Two letter country code.") }, async (args) => {
    try { return text(await m1_byCode(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search", "Search countries by partial name.", { query: z.string().describe("Partial name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
