import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_cities, m0_countries, m0_flag, m1_byCode, m1_byName, m1_search } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'countriesnow-mcp', version: '1.0.0' })
server.registerTool(
    "countries",
    {
      title: "Countries",
      description: "List countries with ISO codes.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_countries(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "cities",
    {
      title: "Cities",
      description: "Cities for a country.",
      inputSchema: z.object( { country: z.string().describe("Country name like Brazil.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_cities(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "flag",
    {
      title: "Flag",
      description: "Flag image URL for a country.",
      inputSchema: z.object( { country: z.string().describe("Country name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_flag(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "by_name",
    {
      title: "By name",
      description: "Get details for a country by name.",
      inputSchema: z.object( { name: z.string().describe("Country name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_byName(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "by_code",
    {
      title: "By code",
      description: "Get details for a country by code.",
      inputSchema: z.object( { code: z.string().describe("Two letter country code.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_byCode(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search countries by partial name.",
      inputSchema: z.object( { query: z.string().describe("Partial name."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
